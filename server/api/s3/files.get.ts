import { defineEventHandler, getQuery } from 'h3'
import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { createS3Client } from '~~/server/utils/s3'
import { getServerS3Config, normalizeRelativePath, toRelativePath } from '~~/server/utils/config'
import type { FileItem } from '~~/types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const s3Config = getServerS3Config(event)
  const userPath = normalizeRelativePath(query.path, 'path')

  const s3Client = createS3Client(s3Config)
  const basePrefix = s3Config.uploadDir
    ? (userPath ? `${s3Config.uploadDir}/${userPath}` : s3Config.uploadDir)
    : userPath
  const normalizedPrefix = basePrefix ? `${basePrefix}/` : ''

  const folderMap = new Map<string, FileItem>()
  const fileMap = new Map<string, FileItem>()

  let continuationToken: string | undefined

  try {
    do {
      const response = await s3Client.send(new ListObjectsV2Command({
        Bucket: s3Config.bucket,
        Prefix: normalizedPrefix,
        Delimiter: '/',
        ContinuationToken: continuationToken,
      }))

      for (const item of response.CommonPrefixes || []) {
        const fullPath = (item.Prefix || '').replace(/\/$/, '')
        const relativePath = toRelativePath(s3Config, fullPath)
        if (!relativePath) continue
        const name = relativePath.split('/').filter(Boolean).pop()
        if (!name) continue
        folderMap.set(relativePath, { name, path: relativePath, type: 'folder' })
      }

      for (const item of response.Contents || []) {
        const fullPath = item.Key || ''
        if (!fullPath || fullPath.endsWith('/')) continue
        const relativePath = toRelativePath(s3Config, fullPath)
        if (!relativePath) continue
        const name = relativePath.split('/').filter(Boolean).pop()
        if (!name) continue
        fileMap.set(relativePath, {
          name,
          path: relativePath,
          type: 'file',
          size: item.Size,
          lastModified: item.LastModified ? item.LastModified.toISOString() : undefined,
        })
      }

      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined
    } while (continuationToken)

    const folders = Array.from(folderMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    const files = Array.from(fileMap.values()).sort((a, b) => a.name.localeCompare(b.name))

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
