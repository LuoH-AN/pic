import { defineEventHandler, getQuery, createError } from 'h3'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

interface S3Config {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  region: string
  publicUrl: string
  uploadDir: string
}

interface AppConfig {
  s3: S3Config
}

// 获取 S3 客户端
function getS3Client(s3Config: S3Config): S3Client {
  return new S3Client({
    endpoint: s3Config.endpoint,
    region: s3Config.region || 'auto',
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
  })
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

  // 获取用户请求的路径（相对于 uploadDir）
  const userPath = (query.path as string) || ''
  // 基础目录（uploadDir）
  const baseDir = s3Config.uploadDir || ''
  
  // 构建完整的 S3 prefix
  // 如果 userPath 为空，prefix 就是 baseDir
  // 如果 userPath 不为空，prefix 是 baseDir + "/" + userPath
  let s3Prefix = baseDir
  if (userPath) {
    s3Prefix = baseDir ? `${baseDir}/${userPath}` : userPath
  }
  
  // 确保 prefix 以斜杠结尾（这样 CommonPrefixes 才会正确返回子文件夹）
  if (s3Prefix && !s3Prefix.endsWith('/')) {
    s3Prefix = s3Prefix + '/'
  }

  try {
    const s3Client = getS3Client(s3Config)
    
    const command = new ListObjectsV2Command({
      Bucket: s3Config.bucket,
      Prefix: s3Prefix,
      Delimiter: '/',
    })

    const response = await s3Client.send(command)

    // 处理文件夹（CommonPrefixes）
    const folders = (response.CommonPrefixes || []).map((item) => {
      const fullPath = item.Prefix || ''
      // fullPath 格式如: "picture/folder1/" 或 "folder1/"
      // 移除基础目录前缀，获取相对路径
      let relativePath = fullPath
      if (baseDir) {
        relativePath = fullPath.replace(new RegExp(`^${baseDir}/`), '')
      }
      // 移除结尾的斜杠
      relativePath = relativePath.replace(/\/$/, '')
      // 获取文件夹名称
      const name = relativePath.split('/').filter(Boolean).pop() || ''
      return {
        name: name,
        path: relativePath,
        type: 'folder' as const,
      }
    }).filter(f => f.name) // 过滤掉空名称

    // 处理文件（Contents）- 排除文件夹本身
    const files = (response.Contents || []).map((item) => {
      const fullPath = item.Key || ''
      // 跳过文件夹（以斜杠结尾的）
      if (fullPath.endsWith('/')) return null
      
      // 移除基础目录前缀，获取相对路径
      let relativePath = fullPath
      if (baseDir) {
        relativePath = fullPath.replace(new RegExp(`^${baseDir}/`), '')
      }
      // 获取文件名
      const name = relativePath.split('/').filter(Boolean).pop() || ''
      return {
        name: name,
        path: relativePath,
        type: 'file' as const,
        size: item.Size,
        lastModified: item.LastModified,
      }
    }).filter((f): f is NonNullable<typeof f> => f !== null && f.name !== '') // 过滤掉空文件名

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
