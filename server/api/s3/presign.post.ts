import { defineEventHandler, readBody, createError } from 'h3'
import { randomBytes } from 'node:crypto'
import { PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { useRuntimeConfig } from '#imports'
import type { S3Client } from '@aws-sdk/client-s3'
import { createS3Client } from '~~/server/utils/s3'
import {
  buildScopedKey,
  getServerS3Config,
  normalizeRenameConfig,
  sanitizeFilename,
} from '~~/server/utils/config'
import { generateFilename } from '~~/server/utils/filename'

interface PresignUploadBody {
  filename?: string
  contentType?: string
  size?: number
  rename?: unknown
}

function normalizeContentType(value: unknown): string {
  if (typeof value !== 'string') return 'application/octet-stream'
  const trimmed = value.trim()
  if (!trimmed) return 'application/octet-stream'
  if (trimmed.includes('\r') || trimmed.includes('\n')) {
    throw createError({ statusCode: 400, message: 'contentType 不合法' })
  }
  return trimmed
}

function normalizeInputFilename(value: unknown): string {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return 'upload'
  const basename = raw.split(/[\\/]/).pop() || ''
  return sanitizeFilename(basename || 'upload', '文件名')
}

// 在相对路径的最后一段文件名（保留目录与扩展名）后追加后缀，用于避免覆盖同名对象。
function addSuffixToFilename(name: string, suffix: string): string {
  const slash = name.lastIndexOf('/')
  const dir = slash >= 0 ? name.slice(0, slash + 1) : ''
  const base = slash >= 0 ? name.slice(slash + 1) : name
  const dot = base.lastIndexOf('.')
  if (dot > 0) {
    return `${dir}${base.slice(0, dot)}-${suffix}${base.slice(dot)}`
  }
  return `${dir}${base}-${suffix}`
}

async function objectExists(client: S3Client, bucket: string, key: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode
    if (status === 404) return false
    const name = (error as { name?: string })?.name
    if (name === 'NotFound' || name === 'NoSuchKey') return false
    // 其它错误（如缺少读权限）不阻断上传：按“无法确认存在”处理，退回原有行为。
    return false
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<PresignUploadBody>(event)
  const runtimeConfig = useRuntimeConfig(event)
  const s3Config = getServerS3Config(event)
  const s3Client = createS3Client(s3Config)

  // 服务端大小校验（best-effort：基于客户端声明的大小，可被绕过；
  // 直传 PUT 无法强制体积，硬性限制需改用预签名 POST 的 content-length-range）。
  const maxUploadMb = Math.max(1, Number(runtimeConfig.public.maxUploadSizeMb || 20))
  const declaredSize = Number(body?.size)
  if (Number.isFinite(declaredSize) && declaredSize > maxUploadMb * 1024 * 1024) {
    throw createError({ statusCode: 413, message: `文件超过上限 ${maxUploadMb}MB` })
  }

  const filename = normalizeInputFilename(body?.filename)
  const contentType = normalizeContentType(body?.contentType)
  const renameConfig = normalizeRenameConfig(body?.rename || null)
  const newFilename = await generateFilename(renameConfig, filename)

  // 避免静默覆盖：若目标已存在，追加短随机后缀直到不冲突（最多尝试 5 次）。
  let finalFilename = newFilename
  let key = buildScopedKey(s3Config, finalFilename)
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const exists = await objectExists(s3Client, s3Config.bucket, key)
    if (!exists) break
    finalFilename = addSuffixToFilename(newFilename, randomBytes(3).toString('hex'))
    key = buildScopedKey(s3Config, finalFilename)
  }

  const command = new PutObjectCommand({
    Bucket: s3Config.bucket,
    Key: key,
    ContentType: contentType,
  })

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 })
    const encodedKey = key.split('/').map(part => encodeURIComponent(part)).join('/')
    const publicBase = String(runtimeConfig.public.s3PublicBaseUrl || '').replace(/\/+$/, '')
    const fallbackBase = `${String(runtimeConfig.public.s3PublicEndpoint || '').replace(/\/+$/, '')}/${s3Config.bucket}`
    const fileUrlBase = publicBase || fallbackBase
    const fileUrl = `${fileUrlBase}/${encodedKey}`

    return {
      success: true,
      uploadUrl,
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      url: fileUrl,
      filename: finalFilename,
      path: finalFilename,
    }
  } catch (error) {
    console.error('生成上传签名失败:', error)
    throw createError({ statusCode: 500, message: '生成上传签名失败' })
  }
})
