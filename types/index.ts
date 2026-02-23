// S3 存储配置
export interface S3Config {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  region: string
  publicUrl: string
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

// 完整应用配置
export interface AppConfig {
  s3: S3Config
  rename: RenameConfig
  compress: CompressConfig
}

// 文件项（S3 文件/文件夹）
export interface FileItem {
  name: string
  path: string
  type: 'file' | 'folder'
  size?: number
  lastModified?: Date
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
