import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { createS3Client } from '~~/server/utils/s3'
import { parseConfigFromHeader, validateS3Config } from '~~/server/utils/config'
import { generateFilename } from '~~/server/utils/filename'
import type { RenameConfig, CompressConfig } from '~~/types'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: '没有上传文件' })
  }

  const appConfig = parseConfigFromHeader(event)
  const { s3: s3Config, rename: renameConfig, compress: compressConfig } = appConfig

  validateS3Config(s3Config)

  const file = formData[0]
  if (!file || !file.data || !file.filename) {
    throw createError({ statusCode: 400, message: '没有文件数据或文件名' })
  }

  // Default configs
  const finalRenameConfig: RenameConfig = renameConfig || {
    strategy: 'timestamp',
    customFormat: '{filename}',
  }

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
      let outputExt: string = finalCompressConfig.format
      let mimeType: string

      switch (finalCompressConfig.format) {
        case 'jpg':
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
        .resize({ withoutEnlargement: true })
        .toFormat(outputExt as any, { quality: finalCompressConfig.quality })
        .toBuffer()

      fileData = compressedBuffer
      fileType = mimeType

      // Update filename with new extension
      newFilename = newFilename.replace(/\.[^/.]+$/, `.${outputExt}`)
    } catch (sharpError) {
      console.error('图片压缩失败，使用原图:', sharpError)
    }
  }

  const uploadDir = (s3Config.uploadDir || '').trim().replace(/^\/+|\/+$/g, '')
  const key = uploadDir ? `${uploadDir}/${newFilename}` : newFilename

  const s3Client = createS3Client(s3Config)

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
