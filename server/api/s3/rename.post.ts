import { defineEventHandler, readBody, createError } from 'h3'
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createS3Client } from '~~/server/utils/s3'
import { parseConfigFromHeader, validateS3Config } from '~~/server/utils/config'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const appConfig = parseConfigFromHeader(event)
  const { s3: s3Config } = appConfig

  validateS3Config(s3Config)

  const rawPath = typeof body?.path === 'string' ? body.path.trim() : ''
  const rawNewName = typeof body?.newName === 'string' ? body.newName.trim() : ''

  if (!rawPath) {
    throw createError({ statusCode: 400, message: '缺少原文件路径' })
  }

  if (!rawNewName) {
    throw createError({ statusCode: 400, message: '缺少新文件名' })
  }

  if (rawNewName.includes('/')) {
    throw createError({ statusCode: 400, message: '文件名不能包含 /' })
  }

  const oldKey = rawPath.replace(/^\/+/, '')
  const oldName = oldKey.split('/').pop() || ''
  const ext = oldName.includes('.') ? oldName.slice(oldName.lastIndexOf('.')) : ''

  // Keep old extension when user only edits base name.
  const newName = rawNewName.includes('.') ? rawNewName : `${rawNewName}${ext}`
  const dir = oldKey.includes('/') ? oldKey.slice(0, oldKey.lastIndexOf('/') + 1) : ''
  const newKey = `${dir}${newName}`.replace(/^\/+/, '')

  if (newKey === oldKey) {
    return { success: true, path: newKey }
  }

  try {
    const s3Client = createS3Client(s3Config)
    const encodedSource = encodeURIComponent(`${s3Config.bucket}/${oldKey}`).replace(/%2F/g, '/')

    await s3Client.send(
      new CopyObjectCommand({
        Bucket: s3Config.bucket,
        Key: newKey,
        CopySource: encodedSource,
      }),
    )

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: s3Config.bucket,
        Key: oldKey,
      }),
    )

    return { success: true, path: newKey }
  } catch (error) {
    console.error('S3 重命名失败:', error)
    throw createError({ statusCode: 500, message: '重命名失败' })
  }
})
