import { defineEventHandler, readBody, createError } from 'h3'
import { CopyObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { createS3Client } from '~~/server/utils/s3'
import { buildScopedKey, getServerS3Config, normalizeRelativePath, sanitizeFilename } from '~~/server/utils/config'

async function checkObjectExists(
  s3Client: ReturnType<typeof createS3Client>,
  bucket: string,
  key: string,
) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch (error: unknown) {
    const httpStatus = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode
    if (httpStatus === 404) return false
    throw error
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ path?: string; newName?: string }>(event)
  const relativePath = normalizeRelativePath(body?.path, 'path')
  if (!relativePath) {
    throw createError({ statusCode: 400, message: '缺少原文件路径' })
  }

  const requestedName = sanitizeFilename(body?.newName, '新文件名')
  const s3Config = getServerS3Config(event)
  const s3Client = createS3Client(s3Config)

  const oldKey = buildScopedKey(s3Config, relativePath)
  const oldName = relativePath.split('/').pop() || ''
  const ext = oldName.includes('.') ? oldName.slice(oldName.lastIndexOf('.')) : ''
  const finalName = requestedName.includes('.') ? requestedName : `${requestedName}${ext}`
  const safeFinalName = sanitizeFilename(finalName, '新文件名')

  const dir = relativePath.includes('/') ? relativePath.slice(0, relativePath.lastIndexOf('/') + 1) : ''
  const newRelativePath = `${dir}${safeFinalName}`
  const newKey = buildScopedKey(s3Config, newRelativePath)

  if (newKey === oldKey) {
    return { success: true, path: newRelativePath }
  }

  try {
    const exists = await checkObjectExists(s3Client, s3Config.bucket, newKey)
    if (exists) {
      throw createError({ statusCode: 409, message: '目标文件名已存在' })
    }

    const encodedSource = encodeURIComponent(`${s3Config.bucket}/${oldKey}`).replace(/%2F/g, '/')
    await s3Client.send(new CopyObjectCommand({
      Bucket: s3Config.bucket,
      Key: newKey,
      CopySource: encodedSource,
      MetadataDirective: 'COPY',
    }))

    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: s3Config.bucket,
        Key: oldKey,
      }))
    } catch (deleteError) {
      try {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: s3Config.bucket,
          Key: newKey,
        }))
      } catch (rollbackError) {
        console.error('S3 重命名回滚失败:', rollbackError)
      }
      console.error('S3 重命名删除旧文件失败:', deleteError)
      throw createError({ statusCode: 500, message: '重命名失败，请重试' })
    }

    return { success: true, path: newRelativePath }
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error
    console.error('S3 重命名失败:', error)
    throw createError({ statusCode: 500, message: '重命名失败' })
  }
})
