import { defineEventHandler, readBody, createError } from 'h3'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

interface S3Config {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  region: string
}

interface AppConfig {
  s3: S3Config
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
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

  const { path: key, content } = body
  if (!key) {
    throw createError({ statusCode: 400, message: '缺少文件路径' })
  }

  try {
    const s3Client = new S3Client({
      endpoint: s3Config.endpoint,
      region: s3Config.region || 'auto',
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
    })

    const command = new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
      Body: content,
      ContentType: 'text/plain; charset=utf-8',
    })

    await s3Client.send(command)

    return { success: true, message: '保存成功' }
  } catch (error) {
    console.error('S3 保存文件失败:', error)
    throw createError({ statusCode: 500, message: '保存失败' })
  }
})
