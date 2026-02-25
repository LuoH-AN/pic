import type { Options as ImageCompressionOptions } from 'browser-image-compression'
import type { CompressConfig, PreviewFile } from '~~/types'

type ImageCompressionFn = (file: File, options: ImageCompressionOptions) => Promise<File | Blob>

let imageCompressionLoader: Promise<ImageCompressionFn> | null = null

const toMb = (bytes: number) => bytes / (1024 * 1024)
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const getImageCompression = async (): Promise<ImageCompressionFn> => {
  if (!import.meta.client) {
    throw new Error('browser-image-compression 仅可在客户端执行')
  }

  if (!imageCompressionLoader) {
    imageCompressionLoader = import('browser-image-compression')
      .then(mod => mod.default as ImageCompressionFn)
  }

  return imageCompressionLoader
}

const getMimeByFormat = (format: CompressConfig['format']) => {
  if (format === 'jpg') return 'image/jpeg'
  if (format === 'png') return 'image/png'
  if (format === 'webp') return 'image/webp'
  return 'image/avif'
}

const getExtensionByFormat = (format: CompressConfig['format']) => {
  return format === 'jpg' ? 'jpg' : format
}

const resolveUploadCompressionOptions = (file: File, config: CompressConfig): ImageCompressionOptions => {
  const sizeMb = toMb(file.size)
  const quality = clamp(config.quality / 100, 0.42, 0.95)

  const isHuge = sizeMb >= 12
  const isLarge = sizeMb >= 6

  return {
    maxSizeMB: isHuge ? 3.5 : isLarge ? 5 : 6,
    maxWidthOrHeight: isHuge ? 2560 : isLarge ? 3072 : 3840,
    useWebWorker: true,
    fileType: getMimeByFormat(config.format),
    initialQuality: quality,
    preserveExif: false,
  }
}

const compressPreviewImage = async (file: File): Promise<string> => {
  try {
    const imageCompression = await getImageCompression()
    const previewBlob = await imageCompression(file, {
      maxSizeMB: 0.28,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.72,
      preserveExif: false,
    })

    return URL.createObjectURL(previewBlob)
  } catch (error) {
    console.warn('生成预览缩略图失败:', error)
    return ''
  }
}

const compressUploadImage = async (file: File, config: CompressConfig): Promise<File> => {
  const imageCompression = await getImageCompression()
  const compressedBlob = await imageCompression(file, resolveUploadCompressionOptions(file, config))

  const extension = getExtensionByFormat(config.format)
  const nextName = `${file.name.replace(/\.[^/.]+$/, '')}.${extension}`

  return new File(
    [compressedBlob],
    nextName,
    {
      type: getMimeByFormat(config.format),
      lastModified: Date.now(),
    },
  )
}

export function useUpload() {
  const runtimeConfig = useRuntimeConfig()
  const { getConfig } = useConfig()
  const { showToast, showLoadingToast, hideToast } = useAppToast()
  const previewFiles = ref<PreviewFile[]>([])
  const isUploading = ref(false)
  const maxUploadSizeMb = Math.max(1, Number(runtimeConfig.public.maxUploadSizeMb || 20))
  const maxUploadCount = Math.max(1, Number(runtimeConfig.public.maxUploadCount || 50))
  const maxUploadBytes = maxUploadSizeMb * 1024 * 1024

  const addFiles = async (files: File[]) => {
    const incomingImages = files.filter(file => file.type.startsWith('image/'))
    const ignoredByType = files.length - incomingImages.length

    let ignoredBySize = 0
    const validBySize = incomingImages.filter((file) => {
      const valid = file.size <= maxUploadBytes
      if (!valid) ignoredBySize += 1
      return valid
    })

    const remainingSlots = Math.max(0, maxUploadCount - previewFiles.value.length)
    const accepted = validBySize.slice(0, remainingSlots)
    const ignoredByCount = validBySize.length - accepted.length

    let previewFailed = 0
    if (accepted.length > 0) {
      showLoadingToast(`正在处理图片预览（0/${accepted.length}）`)
    }

    try {
      for (const [index, file] of accepted.entries()) {
        showLoadingToast(`正在处理图片预览（${index + 1}/${accepted.length}）`)
        const preview = await compressPreviewImage(file)
        if (!preview) previewFailed += 1

        previewFiles.value.push({
          file,
          preview,
          name: file.name,
          copied: false,
        })
      }
    } finally {
      hideToast()
    }

    const tips: string[] = []
    if (ignoredByType > 0) {
      tips.push(`忽略非图片 ${ignoredByType} 个`)
    }
    if (ignoredBySize > 0) {
      tips.push(`忽略超大文件 ${ignoredBySize} 个（>${maxUploadSizeMb}MB）`)
    }
    if (ignoredByCount > 0) {
      tips.push(`最多保留 ${maxUploadCount} 个待上传文件`)
    }
    if (previewFailed > 0) {
      tips.push(`有 ${previewFailed} 张图片仅显示文件占位图（避免大图白屏）`)
    }
    if (tips.length > 0) {
      showToast(tips.join('；'))
    }
  }

  const removeFile = (index: number) => {
    const file = previewFiles.value[index]
    if (file?.preview) {
      URL.revokeObjectURL(file.preview)
    }
    previewFiles.value.splice(index, 1)
  }

  const removeAll = () => {
    previewFiles.value.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    previewFiles.value = []
  }

  const uploadSingle = async (previewFile: PreviewFile) => {
    previewFile.uploading = true
    try {
      const clientConfig = getConfig()
      let uploadFile = previewFile.file
      let compressedByClient = false

      if (clientConfig.compress.enabled) {
        let compressionErrorCaught = false
        showLoadingToast(`正在压缩图片：${previewFile.name}`)
        try {
          uploadFile = await compressUploadImage(previewFile.file, clientConfig.compress)
          compressedByClient = true
        } catch (compressionError) {
          console.error('客户端压缩失败:', compressionError)
          compressionErrorCaught = true
        } finally {
          hideToast()
        }

        if (compressionErrorCaught) {
          showToast('压缩失败，未上传')
          return
        }
      }

      const presignResponse = await $fetch<{
        success: boolean
        uploadUrl: string
        method?: 'PUT'
        headers?: Record<string, string>
        url: string
      }>('/api/s3/presign', {
        method: 'POST',
        body: {
          filename: uploadFile.name,
          contentType: uploadFile.type || 'application/octet-stream',
          rename: clientConfig.rename,
        },
      })

      if (!presignResponse.success || !presignResponse.uploadUrl) {
        throw new Error('上传签名失败')
      }

      const uploadHeaders = { ...(presignResponse.headers || {}) }
      if (!uploadHeaders['Content-Type']) {
        uploadHeaders['Content-Type'] = uploadFile.type || 'application/octet-stream'
      }

      const uploadResult = await fetch(presignResponse.uploadUrl, {
        method: presignResponse.method || 'PUT',
        headers: uploadHeaders,
        body: uploadFile,
      })

      if (!uploadResult.ok) {
        throw new Error(`S3 上传失败: ${uploadResult.status}`)
      }

      previewFile.uploaded = true
      previewFile.url = presignResponse.url
      previewFile.copied = false

      if (compressedByClient) {
        const ratio = 1 - (uploadFile.size / previewFile.file.size)
        const ratioText = ratio > 0
          ? `，体积降低 ${(ratio * 100).toFixed(1)}%`
          : ''
        showToast(`上传成功（客户端压缩${ratioText}）`)
      } else {
        showToast('上传成功')
      }
    } catch (error) {
      console.error('上传失败:', error)
      showToast('上传失败')
    } finally {
      previewFile.uploading = false
    }
  }

  const uploadAll = async () => {
    const filesToUpload = previewFiles.value.filter(file => !file.uploaded && !file.uploading)
    if (filesToUpload.length === 0) {
      showToast('没有需要上传的文件')
      return
    }

    isUploading.value = true
    try {
      for (const previewFile of filesToUpload) {
        await uploadSingle(previewFile)
      }
    } finally {
      isUploading.value = false
    }
  }

  const copyUrl = async (url?: string, previewFile?: PreviewFile) => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      const targetFile = previewFile ?? previewFiles.value.find(file => file.url === url)
      if (targetFile) {
        targetFile.copied = true
      }
      showToast('已复制到剪贴板')
    } catch {
      showToast('复制失败')
    }
  }

  onBeforeUnmount(() => {
    removeAll()
  })

  return {
    previewFiles,
    isUploading,
    maxUploadSizeMb,
    maxUploadCount,
    addFiles,
    removeFile,
    removeAll,
    uploadSingle,
    uploadAll,
    copyUrl,
  }
}
