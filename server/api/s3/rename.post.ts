import { defineEventHandler, readBody, createError } from 'h3'
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

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

  const { path: oldKey, newName } = body
  if (!oldKey || !newName) {
    throw createError({ statusCode: 400, message: '缺少文件路径或新名称' })
  }

  // 获取目录部分
  const lastSlashIndex = oldKey.lastIndexOf('/')
  const directory = lastSlashIndex > -1 ? oldKey.substring(0, lastSlashIndex + 1) : ''
  const newKey = directory + newName

  try {
    const s3Client = new S3Client({
      endpoint: s3Config.endpoint,
      region: s3Config.region || 'auto',
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
    })

    // 复制到新位置
    const copyCommand = new CopyObjectCommand({
      Bucket: s3Config.bucket,
      CopySource: `${s3Config.bucket}/${oldKey}`,
      Key: newKey,
    })

    await s3Client.send(copyCommand)

    // 删除原文件
    const deleteCommand = new DeleteObjectCommand({
      Bucket: s3Config.bucket,
      Key: oldKey,
    })

    await s3Client.send(deleteCommand)

    return { success: true, message: '重命名成功', newKey }
  } catch (error) {
    console.error('S3 重命名失败:', error)
    throw createError({ statusCode: 500, message: '重命名失败' })
  }
})
