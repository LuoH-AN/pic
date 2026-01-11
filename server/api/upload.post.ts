import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
// @ts-ignore
import { randomBytes, createHash } from 'crypto'

// --- Interfaces ---
interface S3Config {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  region: string
  publicUrl: string
  uploadDir: string
}

interface RenameConfig {
  strategy: 'timestamp' | 'random' | 'custom'
  customFormat: string
}

interface CompressConfig {
  enabled: boolean
  quality: number
  format: 'jpg' | 'png' | 'webp' | 'avif' | 'jpeg'
}

interface AppConfig {
  s3: S3Config
  rename?: RenameConfig // Make rename optional for backward compatibility
  compress?: CompressConfig
}

// --- Filename Generation ---
async function generateFilename(
  renameConfig: RenameConfig,
  originalFilename: string
): Promise<string> {
  const strategy = renameConfig?.strategy || 'timestamp'
  const customFormat = renameConfig?.customFormat || '{filename}'

  if (strategy === 'timestamp') {
    const timestamp = Date.now()
    const ext = originalFilename.split('.').pop() || ''
    return `${timestamp}.${ext}`
  }

  if (strategy === 'random') {
    const randomStr = randomBytes(8).toString('hex')
    const ext = originalFilename.split('.').pop() || ''
    return `${randomStr}.${ext}`
  }

  if (strategy === 'custom') {
    const now = new Date()
    const replacements: { [key: string]: () => string } = {
      '{Y}': () => String(now.getFullYear()),
      '{y}': () => String(now.getFullYear()).slice(-2),
      '{m}': () => String(now.getMonth() + 1).padStart(2, '0'),
      '{d}': () => String(now.getDate()).padStart(2, '0'),
      '{h}': () => String(now.getHours()).padStart(2, '0'),
      '{i}': () => String(now.getMinutes()).padStart(2, '0'),
      '{s}': () => String(now.getSeconds()).padStart(2, '0'),
      '{ms}': () => String(now.getMilliseconds()).padStart(3, '0'),
      '{timestamp}': () => String(now.getTime()),
      '{uuid}': () => randomBytes(16).toString('hex'),
      '{md5}': () => createHash('md5').update(randomBytes(16)).digest('hex'),
      '{md5-16}': () => createHash('md5').update(randomBytes(16)).digest('hex').substring(0, 16),
      '{filename}': () => originalFilename.replace(/\.[^/.]+$/, ''), // filename without extension
    }

    let newName = customFormat

    // Handle {str-number} separately
    newName = newName.replace(/{str-(\d+)}/g, (_, num) => {
      const len = parseInt(num, 10)
      return randomBytes(Math.ceil(len / 2)).toString('hex').substring(0, len)
    })

    for (const placeholder in replacements) {
      if (newName.includes(placeholder)) {
        newName = newName.replace(new RegExp(placeholder, 'g'), replacements[placeholder]())
      }
    }
    
    const ext = originalFilename.split('.').pop() || ''
    if (ext) {
      return `${newName}.${ext}`
    }
    return newName
  }

  // Fallback to original filename
  return originalFilename
}

// --- Event Handler ---
export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: '没有上传文件' })
  }

  const configHeader = event.headers.get('x-s3-config')
  if (!configHeader) {
    throw createError({ statusCode: 400, message: '缺少 S3 配置' })
  }

  let appConfig: AppConfig
  try {
    const parsed = JSON.parse(configHeader)
    // Backward compatibility
    if (parsed.endpoint) {
        appConfig = { s3: parsed }
    } else {
        appConfig = parsed
    }
  } catch {
    throw createError({ statusCode: 400, message: '无效的 S3 配置' })
  }

  const { s3: s3Config, rename: renameConfig, compress: compressConfig } = appConfig

  if (!s3Config?.endpoint || !s3Config?.accessKeyId || !s3Config?.secretAccessKey || !s3Config?.bucket) {
    throw createError({ statusCode: 400, message: 'S3 配置不完整' })
  }

  const file = formData[0]
  if (!file || !file.data || !file.filename) {
    throw createError({ statusCode: 400, message: '没有文件数据或文件名' })
  }

  // Default rename config
  const finalRenameConfig: RenameConfig = renameConfig || {
    strategy: 'timestamp',
    customFormat: '{filename}',
  }

  // Default compress config
  const finalCompressConfig: CompressConfig = compressConfig || {
    enabled: false,
    quality: 85,
    format: 'jpg',
  }

  // Check if file is an image and compression is enabled
  const isImage = file.type?.startsWith('image/')
  let fileData = file.data
  let fileType = file.type || 'application/octet-stream'
  let newFilename = await generateFilename(finalRenameConfig, file.filename)

  if (isImage && finalCompressConfig.enabled) {
    try {
      // @ts-ignore
      const sharp = (await import('sharp')).default
      
      // Determine output format and extension
      let outputExt = finalCompressConfig.format
      let mimeType: string
      
      switch (finalCompressConfig.format) {
        case 'jpg':
        case 'jpeg':
          outputExt = 'jpeg'
          mimeType = 'image/jpeg'
          break
        case 'png':
          outputExt = 'png'
          mimeType = 'image/png'
          break
        case 'webp':
          outputExt = 'webp'
          mimeType = 'image/webp'
          break
        case 'avif':
          outputExt = 'avif'
          mimeType = 'image/avif'
          break
        default:
          outputExt = 'jpeg'
          mimeType = 'image/jpeg'
      }

      // Compress the image
      const compressedBuffer = await sharp(file.data)
        .resize({ withoutEnlargement: true }) // Don't enlarge images
        .toFormat(outputExt as any, { quality: finalCompressConfig.quality })
        .toBuffer()

      fileData = compressedBuffer
      fileType = mimeType

      // Update filename with new extension
      newFilename = newFilename.replace(/\.[^/.]+$/, `.${outputExt}`)
    } catch (sharpError) {
      console.error('图片压缩失败，使用原图:', sharpError)
      // Continue with original file if compression fails
    }
  }

  const uploadDir = s3Config.uploadDir || 'picture'
  const key = `${uploadDir}/${newFilename}`.replace(/^\/+/, '') // Ensure key doesn't start with /

  const s3Client = new S3Client({
    endpoint: s3Config.endpoint,
    region: s3Config.region || 'auto',
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
  })

  try {
    const command = new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
      Body: fileData,
      ContentType: fileType,
    })

    await s3Client.send(command)

    let fileUrl: string
    if (s3Config.publicUrl) {
      // Ensure no double slashes
      fileUrl = `${s3Config.publicUrl.replace(/\/$/, '')}/${key}`
    } else {
      fileUrl = `${s3Config.endpoint.replace(/\/$/, '')}/${s3Config.bucket}/${key}`
    }

    return {
      success: true,
      url: fileUrl,
      filename: newFilename,
    }
  } catch (error) {
    console.error('S3 上传失败:', error)
    throw createError({ statusCode: 500, message: '上传失败' })
  }
})
