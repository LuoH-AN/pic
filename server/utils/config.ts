import { createError } from 'h3'
import type { H3Event } from 'h3'
import type { AppConfig, S3Config } from '~/types'

export function parseConfigFromHeader(event: H3Event): AppConfig {
  const configHeader = event.headers.get('x-s3-config')
  if (!configHeader) {
    throw createError({ statusCode: 400, message: '缺少 S3 配置' })
  }

  let appConfig: AppConfig
  try {
    const parsed = JSON.parse(configHeader)
    // Backward compatibility: if parsed has endpoint directly, wrap it
    if (parsed.endpoint) {
      appConfig = {
        s3: parsed,
        rename: parsed.rename || { strategy: 'timestamp', customFormat: '{filename}' },
        compress: parsed.compress || { enabled: false, quality: 85, format: 'jpg' },
      }
    } else {
      appConfig = parsed
    }
  } catch {
    throw createError({ statusCode: 400, message: '无效的 S3 配置' })
  }

  return appConfig
}

export function validateS3Config(s3Config: S3Config): void {
  if (!s3Config?.endpoint || !s3Config?.accessKeyId || !s3Config?.secretAccessKey || !s3Config?.bucket) {
    throw createError({ statusCode: 400, message: 'S3 配置不完整' })
  }
}
