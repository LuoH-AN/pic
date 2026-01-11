import { defineEventHandler, getQuery, createError } from 'h3'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

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

    const response = await s3Client.send(command)
    const body = response.Body

    if (!body) {
      throw createError({ statusCode: 404, message: '文件内容为空' })
    }

    // 将流转换为文本
    const chunks: Uint8Array[] = []
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const content = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      content.set(chunk, offset)
      offset += chunk.length
    }
    const text = new TextDecoder('utf-8').decode(content)

    return { 
      success: true, 
      content: text,
      contentType: response.ContentType,
    }
  } catch (error) {
    console.error('S3 获取文件内容失败:', error)
    throw createError({ statusCode: 500, message: '获取文件内容失败' })
  }
})
