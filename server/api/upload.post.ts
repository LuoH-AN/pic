import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { useRuntimeConfig } from '#imports'
import { createS3Client } from '~~/server/utils/s3'
import {
  buildScopedKey,
  getServerS3Config,
  normalizeCompressConfig,
  normalizeRenameConfig,
  sanitizeRelativeFilePath,
} from '~~/server/utils/config'
import { generateFilename } from '~~/server/utils/filename'

interface MultipartFilePart {
  filename?: string
  type?: string
  data?: Uint8Array
}

interface CompressionProfile {
  id: 'primary' | 'fallback' | 'webp-fallback' | 'jpeg-emergency'
  format: 'jpg' | 'png' | 'webp' | 'avif'
  quality: number
  width: number
  height: number
  mode: 'normal' | 'fast' | 'aggressive' | 'emergency'
}

function isMultipartFilePart(part: unknown): part is MultipartFilePart & { filename: string; data: Uint8Array } {
  if (!part || typeof part !== 'object') return false
  const maybe = part as MultipartFilePart
  return Boolean(maybe.filename && maybe.data)
}

function parseJsonPart<T>(raw: unknown, fieldName: string): T | null {
  if (raw == null) return null
  const text = typeof raw === 'string'
    ? raw.trim()
    : raw instanceof Uint8Array
      ? new TextDecoder().decode(raw).trim()
      : String(raw).trim()
  if (!text) return null
  try {
    return JSON.parse(text) as T
  } catch {
    throw createError({ statusCode: 400, message: `${fieldName} 配置不是合法 JSON` })
  }
}

function getMimeByFormat(format: 'jpg' | 'png' | 'webp' | 'avif') {
  if (format === 'jpg') return 'image/jpeg'
  if (format === 'png') return 'image/png'
  if (format === 'webp') return 'image/webp'
  return 'image/avif'
}

function toMb(bytes: number) {
  return bytes / (1024 * 1024)
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function normalizePositive(value: unknown, fallback: number, min = 1) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(min, Math.round(parsed))
}

function buildCompressionProfiles(options: {
  format: 'jpg' | 'png' | 'webp' | 'avif'
  quality: number
  maxWidth: number
  maxHeight: number
  fastMode: boolean
  aggressiveMode: boolean
  fastModeMaxDimension: number
}) {
  const {
    format,
    quality,
    maxWidth,
    maxHeight,
    fastMode,
    aggressiveMode,
    fastModeMaxDimension,
  } = options

  const primaryMaxWidth = fastMode ? Math.min(maxWidth, fastModeMaxDimension) : maxWidth
  const primaryMaxHeight = fastMode ? Math.min(maxHeight, fastModeMaxDimension) : maxHeight
  const fallbackMaxWidth = Math.max(1024, Math.round(primaryMaxWidth * (aggressiveMode ? 0.82 : 0.9)))
  const fallbackMaxHeight = Math.max(1024, Math.round(primaryMaxHeight * (aggressiveMode ? 0.82 : 0.9)))
  const emergencyMax = Math.max(800, Math.round(Math.min(primaryMaxWidth, primaryMaxHeight) * 0.72))

  const primaryQualityCap = aggressiveMode ? 72 : fastMode ? 76 : 88

  const profiles: CompressionProfile[] = [
    {
      id: 'primary',
      format,
      quality: clampNumber(Math.round(Math.min(quality, primaryQualityCap)), 40, 95),
      width: primaryMaxWidth,
      height: primaryMaxHeight,
      mode: fastMode ? 'fast' : 'normal',
    },
    {
      id: 'fallback',
      format: format === 'png' ? 'webp' : format,
      quality: clampNumber(Math.round(Math.min(quality - 8, 74)), 38, 90),
      width: fallbackMaxWidth,
      height: fallbackMaxHeight,
      mode: 'aggressive',
    },
    {
      id: 'webp-fallback',
      format: 'webp',
      quality: clampNumber(Math.round(Math.min(quality - 14, 68)), 36, 86),
      width: Math.max(960, Math.round(fallbackMaxWidth * 0.9)),
      height: Math.max(960, Math.round(fallbackMaxHeight * 0.9)),
      mode: 'aggressive',
    },
    {
      id: 'jpeg-emergency',
      format: 'jpg',
      quality: clampNumber(Math.round(Math.min(quality - 20, 62)), 34, 82),
      width: emergencyMax,
      height: emergencyMax,
      mode: 'emergency',
    },
  ]

  const uniqueProfiles: CompressionProfile[] = []
  const seen = new Set<string>()
  for (const profile of profiles) {
    const key = `${profile.format}-${profile.quality}-${profile.width}-${profile.height}`
    if (seen.has(key)) continue
    seen.add(key)
    uniqueProfiles.push(profile)
  }
  return uniqueProfiles
}

async function runWithTimeout<T>(task: Promise<T>, timeoutMs: number): Promise<T> {
  if (timeoutMs <= 0) return task

  let timer: ReturnType<typeof setTimeout> | null = null
  try {
    return await Promise.race([
      task,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error('COMPRESSION_TIMEOUT')), timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: '没有上传文件' })
  }

  const fileParts = formData.filter(isMultipartFilePart)
  if (fileParts.length !== 1) {
    throw createError({ statusCode: 400, message: '一次请求仅允许上传一个文件' })
  }

  const [file] = fileParts
  if (!file) {
    throw createError({ statusCode: 400, message: '上传文件无效' })
  }

  const runtimeConfig = useRuntimeConfig(event)
  const maxUploadSizeMb = Math.max(1, Number(runtimeConfig.public.maxUploadSizeMb || 20))
  const maxUploadBytes = maxUploadSizeMb * 1024 * 1024
  if (file.data.length > maxUploadBytes) {
    throw createError({ statusCode: 413, message: `文件过大，最大 ${maxUploadSizeMb}MB` })
  }

  const renamePart = formData.find(part => part.name === 'rename')
  const compressPart = formData.find(part => part.name === 'compress')
  const renameConfig = normalizeRenameConfig(parseJsonPart(renamePart?.data, 'rename') || null)
  const compressConfig = normalizeCompressConfig(parseJsonPart(compressPart?.data, 'compress') || null)

  const s3Config = getServerS3Config(event)
  const s3Client = createS3Client(s3Config)

  const isImage = file.type?.startsWith('image/')
  const originalFilename = file.filename || 'upload'
  const clientCompressionEnabled = Boolean(compressConfig.enabled)
  const mustCompressImage = Boolean(isImage && clientCompressionEnabled)

  let fileData = file.data
  let fileType = file.type || 'application/octet-stream'
  let newFilename = await generateFilename(renameConfig, originalFilename)
  let compressionApplied = false
  let compressionMessage = ''

  if (clientCompressionEnabled && !isImage) {
    throw createError({ statusCode: 400, message: '仅图片支持压缩' })
  }

  if (mustCompressImage) {
    const fileSizeMb = toMb(file.data.length)
    const maxWidth = normalizePositive(runtimeConfig.imageCompressMaxWidth, 2560, 256)
    const maxHeight = normalizePositive(runtimeConfig.imageCompressMaxHeight, 2560, 256)
    const maxPixels = normalizePositive(runtimeConfig.imageCompressMaxPixels, 60000000, 1000000)
    const fastModeThresholdMb = normalizePositive(runtimeConfig.imageCompressFastModeThresholdMb, 4, 1)
    const aggressiveThresholdMb = Math.max(
      fastModeThresholdMb,
      normalizePositive(runtimeConfig.imageCompressAggressiveThresholdMb, 8, fastModeThresholdMb),
    )
    const fastModeMaxDimension = normalizePositive(runtimeConfig.imageCompressFastModeMaxDimension, 1600, 512)
    const compressTimeoutMs = normalizePositive(runtimeConfig.imageCompressTimeoutMs, 5000, 500)

    const fastMode = fileSizeMb >= fastModeThresholdMb
    const aggressiveMode = fileSizeMb >= aggressiveThresholdMb

    const profiles = buildCompressionProfiles({
      format: compressConfig.format,
      quality: compressConfig.quality,
      maxWidth,
      maxHeight,
      fastMode,
      aggressiveMode,
      fastModeMaxDimension,
    })

    try {
      const sharp = (await import('sharp')).default
      let selected: { profile: CompressionProfile; buffer: Buffer } | null = null
      let bestAttempt: { profile: CompressionProfile; buffer: Buffer } | null = null

      for (const [index, profile] of profiles.entries()) {
        try {
          let pipeline = sharp(file.data, {
            sequentialRead: true,
            limitInputPixels: maxPixels,
            failOn: 'none',
          })
            .rotate()
            .resize({
              width: profile.width,
              height: profile.height,
              fit: 'inside',
              withoutEnlargement: true,
              fastShrinkOnLoad: true,
            })

          if (profile.format === 'jpg') {
            pipeline = pipeline.jpeg({
              quality: profile.quality,
              mozjpeg: profile.mode === 'normal',
              progressive: profile.mode === 'normal',
              chromaSubsampling: '4:2:0',
            })
          } else if (profile.format === 'png') {
            pipeline = pipeline.png({
              compressionLevel: profile.mode === 'normal' ? 8 : 4,
              effort: profile.mode === 'normal' ? 6 : 1,
              palette: profile.mode !== 'normal',
              quality: profile.quality,
            })
          } else if (profile.format === 'webp') {
            pipeline = pipeline.webp({
              quality: profile.quality,
              effort: profile.mode === 'normal' ? 5 : profile.mode === 'fast' ? 3 : 2,
              smartSubsample: profile.mode === 'normal',
            })
          } else {
            pipeline = pipeline.avif({
              quality: profile.quality,
              effort: profile.mode === 'normal' ? 4 : 1,
            })
          }

          const timeoutMs = profile.mode === 'emergency'
            ? Math.max(2000, Math.round(compressTimeoutMs * 0.7))
            : compressTimeoutMs

          const output = await runWithTimeout(pipeline.toBuffer(), timeoutMs)
          const attempt = { profile, buffer: output }

          if (!bestAttempt || output.length < bestAttempt.buffer.length) {
            bestAttempt = attempt
          }

          const reductionRatio = 1 - (output.length / file.data.length)
          const isFinalProfile = index === profiles.length - 1
          if (reductionRatio >= 0.01 || isFinalProfile) {
            selected = attempt
            break
          }
        } catch (profileError) {
          console.warn(`压缩档位失败: ${profile.id}`, profileError)
        }
      }

      const finalResult = selected || bestAttempt
      if (!finalResult) {
        throw createError({ statusCode: 500, message: '图片压缩失败，请稍后重试' })
      }

      fileData = finalResult.buffer
      fileType = getMimeByFormat(finalResult.profile.format)
      compressionApplied = true

      const baseName = newFilename.replace(/\.[^/.]+$/, '')
      newFilename = sanitizeRelativeFilePath(`${baseName}.${finalResult.profile.format}`, '生成的文件名')

      const ratio = 1 - (fileData.length / file.data.length)
      const ratioText = ratio > 0
        ? `体积降低 ${(ratio * 100).toFixed(1)}%`
        : '体积变化不明显'
      const modeText = finalResult.profile.mode === 'normal'
        ? '标准压缩'
        : finalResult.profile.mode === 'fast'
          ? '快速压缩'
          : finalResult.profile.mode === 'aggressive'
            ? '增强压缩'
            : '应急压缩'
      compressionMessage = `${modeText}，${ratioText}`
    } catch (error) {
      console.error('图片压缩失败:', error)
      throw createError({ statusCode: 500, message: '图片压缩失败，请稍后重试' })
    }
  }

  const key = buildScopedKey(s3Config, newFilename)

  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
      Body: fileData,
      ContentType: fileType,
    }))

    const encodedKey = key.split('/').map(part => encodeURIComponent(part)).join('/')
    const publicBase = String(runtimeConfig.public.s3PublicBaseUrl || '').replace(/\/+$/, '')
    const fallbackBase = `${String(runtimeConfig.public.s3PublicEndpoint || '').replace(/\/+$/, '')}/${s3Config.bucket}`
    const fileUrlBase = publicBase || fallbackBase
    const fileUrl = `${fileUrlBase}/${encodedKey}`

    return {
      success: true,
      url: fileUrl,
      filename: newFilename,
      path: newFilename,
      compressionRequested: Boolean(mustCompressImage),
      compressionApplied,
      compressionMessage,
    }
  } catch (error) {
    console.error('S3 上传失败:', error)
    throw createError({ statusCode: 500, message: '上传失败' })
  }
})
