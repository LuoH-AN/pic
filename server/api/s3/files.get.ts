import { defineEventHandler, getQuery, createError } from 'h3'
import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { createS3Client } from '~~/server/utils/s3'
import { parseConfigFromHeader, validateS3Config } from '~~/server/utils/config'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const appConfig = parseConfigFromHeader(event)
  const { s3: s3Config } = appConfig

  validateS3Config(s3Config)

  // User requested path (relative to uploadDir)
  const userPath = (query.path as string) || ''
  const baseDir = s3Config.uploadDir || ''

  // Build full S3 prefix
  let s3Prefix = baseDir
  if (userPath) {
    s3Prefix = baseDir ? `${baseDir}/${userPath}` : userPath
  }

  // Ensure prefix ends with slash for CommonPrefixes to work
  if (s3Prefix && !s3Prefix.endsWith('/')) {
    s3Prefix = s3Prefix + '/'
  }

  try {
    const s3Client = createS3Client(s3Config)

    const command = new ListObjectsV2Command({
      Bucket: s3Config.bucket,
      Prefix: s3Prefix,
      Delimiter: '/',
    })

    const response = await s3Client.send(command)

    // Process folders (CommonPrefixes)
    const folders = (response.CommonPrefixes || []).map((item) => {
      const fullPath = item.Prefix || ''
      let relativePath = fullPath
      if (baseDir) {
        relativePath = fullPath.replace(new RegExp(`^${baseDir}/`), '')
      }
      relativePath = relativePath.replace(/\/$/, '')
      const name = relativePath.split('/').filter(Boolean).pop() || ''
      return {
        name: name,
        path: relativePath,
        type: 'folder' as const,
      }
    }).filter(f => f.name)

    // Process files (Contents) - exclude folders
    const files = (response.Contents || []).map((item) => {
      const fullPath = item.Key || ''
      if (fullPath.endsWith('/')) return null

      let relativePath = fullPath
      if (baseDir) {
        relativePath = fullPath.replace(new RegExp(`^${baseDir}/`), '')
      }
      const name = relativePath.split('/').filter(Boolean).pop() || ''
      return {
        name: name,
        path: relativePath,
        type: 'file' as const,
        size: item.Size,
        lastModified: item.LastModified,
      }
    }).filter((f): f is NonNullable<typeof f> => f !== null && f.name !== '')

    return {
      success: true,
      currentPath: userPath,
      folders,
      files,
    }
  } catch (error) {
    console.error('S3 列表获取失败:', error)
    throw createError({ statusCode: 500, message: '获取文件列表失败' })
  }
})
