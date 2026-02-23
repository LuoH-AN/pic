import type { PreviewFile } from '~~/types'

export function useUpload() {
  const { getConfig } = useConfig()
  const { showToast } = useAppToast()
  const previewFiles = ref<PreviewFile[]>([])
  const isUploading = ref(false)

  const addFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    imageFiles.forEach(file => {
      const preview = URL.createObjectURL(file)
      previewFiles.value.push({
        file,
        preview,
        name: file.name,
        copied: false,
      })
    })
  }

  const removeFile = (index: number) => {
    const file = previewFiles.value[index]
    if (file) {
      URL.revokeObjectURL(file.preview)
    }
    previewFiles.value.splice(index, 1)
  }

  const removeAll = () => {
    previewFiles.value.forEach(f => URL.revokeObjectURL(f.preview))
    previewFiles.value = []
  }

  const uploadSingle = async (previewFile: PreviewFile) => {
    const config = getConfig()
    if (!config) {
      showToast('请先配置 S3 信息')
      return
    }

    previewFile.uploading = true
    try {
      const formData = new FormData()
      formData.append('file', previewFile.file)

      const response = await $fetch<{ success: boolean; url: string }>('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'x-s3-config': JSON.stringify(config),
        },
      })

      if (response.success) {
        previewFile.uploaded = true
        previewFile.url = response.url
        previewFile.copied = false
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
    const config = getConfig()
    if (!config) {
      showToast('请先配置 S3 信息')
      return
    }

    const filesToUpload = previewFiles.value.filter(f => !f.uploaded && !f.uploading)
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
    } catch (e) {
      showToast('复制失败')
    }
  }

  return { previewFiles, isUploading, addFiles, removeFile, removeAll, uploadSingle, uploadAll, copyUrl }
}
