import { defineEventHandler, readBody, createError } from 'h3'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createS3Client } from '~~/server/utils/s3'
import { parseConfigFromHeader, validateS3Config } from '~~/server/utils/config'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const appConfig = parseConfigFromHeader(event)
  const { s3: s3Config } = appConfig

  validateS3Config(s3Config)

  const { path: key } = body
  if (!key) {
    throw createError({ statusCode: 400, message: '缺少文件路径' })
  }

  try {
    const s3Client = createS3Client(s3Config)

    const command = new DeleteObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
    })

    await s3Client.send(command)

    return { success: true, message: '删除成功' }
  } catch (error) {
    console.error('S3 删除失败:', error)
    throw createError({ statusCode: 500, message: '删除失败' })
  }
})
