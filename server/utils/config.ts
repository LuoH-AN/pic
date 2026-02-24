import { createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'
import type { CompressConfig, RenameConfig, S3Config } from '~~/types'

const INVALID_FILENAME_CHARS = /[\\/\u0000-\u001F\u007F<>:"|?*]/
const INVALID_PATH_SEGMENT_CHARS = /[\\\u0000-\u001F\u007F<>:"|?*]/
const VALID_RENAME_STRATEGIES = new Set<RenameConfig['strategy']>(['timestamp', 'random', 'custom'])
const VALID_COMPRESS_FORMATS = new Set<CompressConfig['format']>(['jpg', 'png', 'webp', 'avif'])

export function normalizeRelativePath(value: unknown, fieldName = 'path'): string {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) return ''

  const normalized = raw
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')

  if (!normalized) return ''

  const segments = normalized.split('/')
  for (const segment of segments) {
    if (!segment || segment === '.' || segment === '..') {
      throw createError({ statusCode: 400, message: `${fieldName} 不合法` })
    }
  }

  return segments.join('/')
}

export function sanitizeFilename(value: unknown, fieldName = '文件名'): string {
  const name = typeof value === 'string' ? value.trim() : ''
  if (!name) {
    throw createError({ statusCode: 400, message: `${fieldName}不能为空` })
  }
  if (name === '.' || name === '..' || INVALID_FILENAME_CHARS.test(name) || name.length > 255) {
    throw createError({ statusCode: 400, message: `${fieldName}不合法` })
  }
  return name
}

export function sanitizeRelativeFilePath(value: unknown, fieldName = '文件路径'): string {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) {
    throw createError({ statusCode: 400, message: `${fieldName}不能为空` })
  }

  const normalized = raw
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')

  if (!normalized) {
    throw createError({ statusCode: 400, message: `${fieldName}不合法` })
  }

  const segments = normalized.split('/')
  for (const segment of segments) {
    if (!segment || segment === '.' || segment === '..') {
      throw createError({ statusCode: 400, message: `${fieldName}不合法` })
    }
    if (segment.length > 255 || INVALID_PATH_SEGMENT_CHARS.test(segment)) {
      throw createError({ statusCode: 400, message: `${fieldName}不合法` })
    }
  }

  return segments.join('/')
}

export function getServerS3Config(event: H3Event): S3Config {
  const runtimeConfig = useRuntimeConfig(event)
  const s3Config: S3Config = {
    endpoint: String(runtimeConfig.s3Endpoint || ''),
    region: String(runtimeConfig.s3Region || 'auto'),
    bucket: String(runtimeConfig.s3Bucket || ''),
    accessKeyId: String(runtimeConfig.s3AccessKeyId || ''),
    secretAccessKey: String(runtimeConfig.s3SecretAccessKey || ''),
    uploadDir: normalizeRelativePath(runtimeConfig.s3UploadDir, 'S3_UPLOAD_DIR'),
  }

  validateS3Config(s3Config)
  return s3Config
}

export function validateS3Config(s3Config: S3Config): void {
  const endpoint = s3Config.endpoint?.trim()
  if (!endpoint || !endpoint.startsWith('http')) {
    throw createError({ statusCode: 500, message: '服务端 S3 endpoint 配置无效' })
  }
  if (!s3Config.accessKeyId || !s3Config.secretAccessKey || !s3Config.bucket) {
    throw createError({ statusCode: 500, message: '服务端 S3 配置不完整' })
  }
}

export function buildScopedKey(s3Config: S3Config, relativePath: string): string {
  const normalizedRelative = normalizeRelativePath(relativePath, 'path')
  if (!normalizedRelative) {
    throw createError({ statusCode: 400, message: '缺少文件路径' })
  }
  if (!s3Config.uploadDir) return normalizedRelative
  return `${s3Config.uploadDir}/${normalizedRelative}`
}

export function toRelativePath(s3Config: S3Config, fullPath: string): string {
  const normalizedFull = normalizeRelativePath(fullPath, 'path')
  if (!normalizedFull) return ''
  if (!s3Config.uploadDir) return normalizedFull
  if (normalizedFull === s3Config.uploadDir) return ''
  if (!normalizedFull.startsWith(`${s3Config.uploadDir}/`)) return ''
  return normalizedFull.slice(s3Config.uploadDir.length + 1)
}

export function normalizeRenameConfig(raw: unknown): RenameConfig {
  const parsed = (raw && typeof raw === 'object') ? (raw as Partial<RenameConfig>) : {}
  const strategy = VALID_RENAME_STRATEGIES.has(parsed.strategy as RenameConfig['strategy'])
    ? (parsed.strategy as RenameConfig['strategy'])
    : 'timestamp'
  const customFormat = typeof parsed.customFormat === 'string' && parsed.customFormat.trim()
    ? parsed.customFormat.trim()
    : '{filename}'

  return { strategy, customFormat }
}

export function normalizeCompressConfig(raw: unknown): CompressConfig {
  const parsed = (raw && typeof raw === 'object') ? (raw as Partial<CompressConfig>) : {}
  const format = VALID_COMPRESS_FORMATS.has(parsed.format as CompressConfig['format'])
    ? (parsed.format as CompressConfig['format'])
    : 'jpg'
  const qualityRaw = Number(parsed.quality)
  const quality = Number.isFinite(qualityRaw) ? Math.max(1, Math.min(100, Math.round(qualityRaw))) : 85

  return {
    enabled: Boolean(parsed.enabled),
    format,
    quality,
  }
}
