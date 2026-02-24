// 服务端 S3 配置（由环境变量托管）
export interface S3Config {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  region: string
  uploadDir?: string
}

// 重命名配置
export interface RenameConfig {
  strategy: 'timestamp' | 'random' | 'custom'
  customFormat: string
}

// 压缩配置
export interface CompressConfig {
  enabled: boolean
  quality: number
  format: 'jpg' | 'png' | 'webp' | 'avif'
}

// 客户端可配置项（不包含敏感信息）
export interface ClientConfig {
  rename: RenameConfig
  compress: CompressConfig
}

// 文件项（S3 文件/文件夹）
export interface FileItem {
  name: string
  path: string
  type: 'file' | 'folder'
  size?: number
  lastModified?: string
}

// 预览文件（上传前）
export interface PreviewFile {
  file: File
  preview: string
  name: string
  uploaded?: boolean
  url?: string
  uploading?: boolean
  copied?: boolean
}
