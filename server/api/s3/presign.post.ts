import { defineEventHandler, readBody, createError } from 'h3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { useRuntimeConfig } from '#imports'
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

export default defineEventHandler(async (event) => {
  const body = await readBody<PresignUploadBody>(event)
  const runtimeConfig = useRuntimeConfig(event)
  const s3Config = getServerS3Config(event)
  const s3Client = createS3Client(s3Config)

  const filename = normalizeInputFilename(body?.filename)
  const contentType = normalizeContentType(body?.contentType)
  const renameConfig = normalizeRenameConfig(body?.rename || null)
  const newFilename = await generateFilename(renameConfig, filename)

  const key = buildScopedKey(s3Config, newFilename)
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
      filename: newFilename,
      path: newFilename,
    }
  } catch (error) {
    console.error('生成上传签名失败:', error)
    throw createError({ statusCode: 500, message: '生成上传签名失败' })
  }
})
