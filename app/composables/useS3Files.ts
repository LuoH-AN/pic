import type { FileItem } from '~~/types'

export function useS3Files() {
  const { getConfig } = useConfig()
  const { showToast } = useAppToast()

  const currentPath = ref('')
  const folders = ref<FileItem[]>([])
  const files = ref<FileItem[]>([])
  const loading = ref(false)

  const pathParts = computed(() => {
    if (!currentPath.value) return []
    return currentPath.value.split('/').filter(Boolean)
  })

  const imageFiles = computed(() => {
    return files.value.filter(file => isImage(file.name))
  })

  const hasItems = computed(() => folders.value.length > 0 || imageFiles.value.length > 0)

  const isImage = (name?: string) => {
    if (!name) return false
    const ext = name.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext || '')
  }

  const fetchFiles = async () => {
    const config = getConfig()
    if (!config) {
      showToast('请先配置 S3 信息')
      return
    }

    loading.value = true
    try {
      const response = await $fetch<{
        success: boolean
        folders: FileItem[]
        files: FileItem[]
      }>('/api/s3/files', {
        method: 'GET',
        params: { path: currentPath.value },
        headers: {
          'x-s3-config': JSON.stringify(config),
        },
      })

      if (response.success) {
        folders.value = response.folders
        files.value = response.files
      }
    } catch (error) {
      console.error('获取文件列表失败:', error)
      showToast('获取文件列表失败')
    } finally {
      loading.value = false
    }
  }

  const navigateTo = (path: string) => {
    currentPath.value = path
    fetchFiles()
  }

  const getImageUrl = (file: FileItem) => {
    const config = getConfig()
    if (!config) return ''

    const fullPath = getFullPath(file.path)

    if (config.s3.publicUrl) {
      return `${config.s3.publicUrl}/${fullPath}`
    }

    return `${config.s3.endpoint}/${fullPath}`
  }

  const getFullPath = (path: string) => {
    const config = getConfig()
    const uploadDir = config?.s3?.uploadDir || ''

    if (uploadDir) {
      return `${uploadDir}/${path}`
    }
    return path
  }

  const deleteFile = async (path: string) => {
    const config = getConfig()
    if (!config) return

    try {
      await $fetch('/api/s3/delete', {
        method: 'DELETE',
        body: { path: getFullPath(path) },
        headers: { 'x-s3-config': JSON.stringify(config) },
      })
      showToast('删除成功')
      fetchFiles()
    } catch (error) {
      console.error('删除失败:', error)
      showToast('删除失败')
    }
  }

  return {
    currentPath,
    folders,
    files,
    loading,
    pathParts,
    imageFiles,
    hasItems,
    fetchFiles,
    navigateTo,
    getImageUrl,
    deleteFile,
  }
}
