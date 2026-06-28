import type { PreviewFile } from '~~/types'
import { compressImageForUpload, makePreviewObjectUrl } from '~/utils/imageCompressor'
import { copyText } from '~/utils/clipboard'

export function useUpload() {
  const runtimeConfig = useRuntimeConfig()
  const { getConfig } = useConfig()
  const { showToast, showLoadingToast, hideToast } = useAppToast()
  const previewFiles = ref<PreviewFile[]>([])
  const isUploading = ref(false)
  const maxUploadSizeMb = Math.max(1, Number(runtimeConfig.public.maxUploadSizeMb || 20))
  const maxUploadCount = Math.max(1, Number(runtimeConfig.public.maxUploadCount || 50))
  const maxUploadBytes = maxUploadSizeMb * 1024 * 1024

  let nextPreviewId = 0
  const fileSignature = (file: File) => `${file.name}::${file.size}::${file.lastModified}`

  const addFiles = async (files: File[]) => {
    const incomingImages = files.filter(file => file.type.startsWith('image/'))
    const ignoredByType = files.length - incomingImages.length

    let ignoredBySize = 0
    const validBySize = incomingImages.filter((file) => {
      const valid = file.size <= maxUploadBytes
      if (!valid) ignoredBySize += 1
      return valid
    })

    // 去重：跳过队列中已存在的相同文件（同名 + 同大小 + 同修改时间）。
    const existingSignatures = new Set(previewFiles.value.map(item => fileSignature(item.file)))
    let ignoredByDuplicate = 0
    const deduped = validBySize.filter((file) => {
      const signature = fileSignature(file)
      if (existingSignatures.has(signature)) {
        ignoredByDuplicate += 1
        return false
      }
      existingSignatures.add(signature)
      return true
    })

    const remainingSlots = Math.max(0, maxUploadCount - previewFiles.value.length)
    const accepted = deduped.slice(0, remainingSlots)
    const ignoredByCount = deduped.length - accepted.length

    let previewFailed = 0
    if (accepted.length > 0) {
      showLoadingToast(`正在处理图片预览（0/${accepted.length}）`)
    }

    try {
      for (const [index, file] of accepted.entries()) {
        showLoadingToast(`正在处理图片预览（${index + 1}/${accepted.length}）`)
        const preview = await makePreviewObjectUrl(file)
        if (!preview) previewFailed += 1

        previewFiles.value.push({
          id: ++nextPreviewId,
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
    if (ignoredByDuplicate > 0) {
      tips.push(`忽略重复文件 ${ignoredByDuplicate} 个`)
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
        showLoadingToast(`正在压缩图片：${previewFile.name}`)
        try {
          uploadFile = await compressImageForUpload(previewFile.file, clientConfig.compress)
          compressedByClient = true
        } catch (compressionError) {
          // 压缩失败时不再中断上传，改为上传原图，避免丢失这次上传。
          console.error('客户端压缩失败，改为上传原图:', compressionError)
          uploadFile = previewFile.file
          compressedByClient = false
        } finally {
          hideToast()
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
          size: uploadFile.size,
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
          : '，体积未减小'
        showToast(`上传成功（客户端压缩${ratioText}）`)
      } else if (clientConfig.compress.enabled) {
        // 启用了压缩却走到这里 → compressImageForUpload 抛错，已 fallback 为原图。
        // 显式提示，避免"上传成功"掩盖压缩失败（常见诱因：HEIC 等格式无法被浏览器解码、AVIF Worker/WASM 加载失败）。
        showToast('上传成功（压缩失败，已上传原图）')
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
    const ok = await copyText(url)
    if (ok) {
      const targetFile = previewFile ?? previewFiles.value.find(file => file.url === url)
      if (targetFile) {
        targetFile.copied = true
      }
      showToast('已复制到剪贴板')
    } else {
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
