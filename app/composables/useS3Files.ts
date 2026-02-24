import type { FileItem } from '~~/types'

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'])

function normalizeClientPath(path: string) {
  const raw = (path || '').trim()
  if (!raw) return ''
  return raw
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(part => part && part !== '.' && part !== '..')
    .join('/')
}

function encodePath(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map(part => encodeURIComponent(part))
    .join('/')
}

export function useS3Files() {
  const runtimeConfig = useRuntimeConfig()
  const { showToast } = useAppToast()

  const currentPath = ref('')
  const folders = ref<FileItem[]>([])
  const files = ref<FileItem[]>([])
  const loading = ref(false)
  const activeRequestId = ref(0)

  const imageFiles = computed(() => files.value.filter(file => isImage(file.name)))

  const isImage = (name?: string) => {
    if (!name) return false
    const ext = name.split('.').pop()?.toLowerCase()
    return IMAGE_EXTENSIONS.has(ext || '')
  }

  const fetchFiles = async (path = currentPath.value) => {
    const normalizedPath = normalizeClientPath(path)
    const requestId = activeRequestId.value + 1
    activeRequestId.value = requestId
    loading.value = true

    try {
      const response = await $fetch<{
        success: boolean
        folders: FileItem[]
        files: FileItem[]
      }>('/api/s3/files', {
        method: 'GET',
        params: { path: normalizedPath },
      })

      if (requestId !== activeRequestId.value) return
      if (response.success) {
        currentPath.value = normalizedPath
        folders.value = response.folders
        files.value = response.files
      }
    } catch (error) {
      if (requestId !== activeRequestId.value) return
      console.error('获取文件列表失败:', error)
      showToast('获取文件列表失败')
    } finally {
      if (requestId === activeRequestId.value) {
        loading.value = false
      }
    }
  }

  const navigateTo = async (path: string) => {
    const normalizedPath = normalizeClientPath(path)
    await fetchFiles(normalizedPath)
  }

  const getImageUrl = (file: FileItem) => {
    const normalizedFilePath = normalizeClientPath(file.path)
    const uploadDir = normalizeClientPath(runtimeConfig.public.s3UploadDir || '')
    const fullPath = uploadDir ? `${uploadDir}/${normalizedFilePath}` : normalizedFilePath
    const encoded = encodePath(fullPath)
    const base = String(runtimeConfig.public.s3PublicBaseUrl || '').replace(/\/+$/, '')
    const fallbackBase = `${String(runtimeConfig.public.s3PublicEndpoint || '').replace(/\/+$/, '')}/${runtimeConfig.public.s3Bucket}`
    const urlBase = base || fallbackBase
    if (!urlBase || urlBase === '/') {
      return `/${encoded}`
    }
    return `${urlBase}/${encoded}`
  }

  const deleteFile = async (path: string) => {
    const normalizedPath = normalizeClientPath(path)
    if (!normalizedPath) return false

    try {
      await $fetch('/api/s3/delete', {
        method: 'DELETE',
        body: { path: normalizedPath },
      })
      showToast('删除成功')
      await fetchFiles()
      return true
    } catch (error) {
      console.error('删除失败:', error)
      showToast('删除失败')
      return false
    }
  }

  const renameFile = async (path: string, newName: string) => {
    const normalizedPath = normalizeClientPath(path)
    if (!normalizedPath) return false

    try {
      await $fetch('/api/s3/rename', {
        method: 'POST',
        body: { path: normalizedPath, newName },
      })
      showToast('重命名成功')
      await fetchFiles()
      return true
    } catch (error: unknown) {
      const statusCode = (error as { statusCode?: number })?.statusCode
      if (statusCode === 409) {
        showToast('目标文件名已存在')
      } else {
        showToast('重命名失败')
      }
      console.error('重命名失败:', error)
      return false
    }
  }

  return {
    currentPath,
    folders,
    files,
    loading,
    imageFiles,
    fetchFiles,
    navigateTo,
    getImageUrl,
    deleteFile,
    renameFile,
  }
}
