import { defineEventHandler, getQuery, createError } from 'h3'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

interface S3Config {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  region: string
  publicUrl: string
}

interface AppConfig {
  s3: S3Config
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const configHeader = event.headers.get('x-s3-config')
  
  if (!configHeader) {
    throw createError({ statusCode: 400, message: '缺少 S3 配置' })
  }

  let appConfig: AppConfig
  try {
    const parsed = JSON.parse(configHeader)
    if (parsed.endpoint) {
      appConfig = { s3: parsed }
    } else {
      appConfig = parsed
    }
  } catch {
    throw createError({ statusCode: 400, message: '无效的 S3 配置' })
  }

  const { s3: s3Config } = appConfig

  if (!s3Config?.endpoint || !s3Config?.accessKeyId || !s3Config?.secretAccessKey || !s3Config?.bucket) {
    throw createError({ statusCode: 400, message: 'S3 配置不完整' })
  }

  const path = query.path as string
  if (!path) {
    throw createError({ statusCode: 400, message: '缺少文件路径' })
  }

  try {
    // 如果有公共 URL，直接返回
    if (s3Config.publicUrl) {
      const url = `${s3Config.publicUrl.replace(/\/$/, '')}/${path}`
      return { success: true, url }
    }

    // 否则生成预签名 URL
    const s3Client = new S3Client({
      endpoint: s3Config.endpoint,
      region: s3Config.region || 'auto',
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
    })

    const command = new GetObjectCommand({
      Bucket: s3Config.bucket,
      Key: path,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    return { success: true, url }
  } catch (error) {
    console.error('S3 获取下载链接失败:', error)
    throw createError({ statusCode: 500, message: '获取下载链接失败' })
  }
})
