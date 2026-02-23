<template>
  <div class="page-container">
    <div class="file-manager">
      <section class="path-card">
        <div class="path-main">
          <button class="home-btn" type="button" :title="homeTitle" @click="goHome">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 11l9-8 9 8" />
              <path d="M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10" />
            </svg>
          </button>
          <div class="path-select-chain">
            <template v-for="(selector, index) in pathSelectors" :key="selector.key">
              <span class="path-separator">/</span>
              <div class="path-select-wrap">
                <button
                  class="path-token"
                  type="button"
                  :disabled="selector.options.length === 0"
                  @click="togglePathMenu(index, $event)"
                >
                  {{ selector.label }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </section>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <div v-else-if="!hasImages" class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <p>当前目录暂无图片</p>
      </div>

      <div
        v-else
        id="file-gallery"
        ref="galleryRef"
        class="masonry-grid"
      >
        <a
          v-for="(file, index) in imageFiles"
          :key="file.path"
          class="masonry-item pswp-gallery-item"
          :data-path="file.path"
          :href="getImageUrl(file)"
          :data-pswp-width="getPhotoWidth(file)"
          :data-pswp-height="getPhotoHeight(file)"
          :data-pswp-alt="file.name"
          :style="getMasonryStyle(file.path)"
          @click.prevent="handleImageClick(index)"
          @contextmenu.prevent="handleImageContextMenu(index, $event)"
          @touchstart.passive="handleImageTouchStart(index, $event)"
          @touchmove.passive="handleImageTouchMove($event)"
          @touchend="handleImageTouchEnd"
          @touchcancel="handleImageTouchEnd"
        >
          <img
            :src="getImageUrl(file)"
            :alt="file.name"
            draggable="false"
            loading="lazy"
            @load="captureDimensions(file.path, $event)"
            @contextmenu.prevent
          />
        </a>
      </div>
    </div>

    <div
      v-if="showPathMenu && activePathSelector"
      ref="pathMenuRef"
      class="path-option-menu"
      :style="{
        left: `${pathMenuPosition.x}px`,
        top: `${pathMenuPosition.y}px`,
      }"
      @click.stop
    >
      <button
        v-for="folder in activePathSelector.options"
        :key="folder.path"
        class="path-option-btn"
        type="button"
        @click="selectPathMenuOption(folder.path)"
      >
        {{ folder.name }}
      </button>
    </div>

    <div
      v-if="showImageContextMenu"
      ref="imageMenuRef"
      class="image-context-menu"
      :style="{
        left: `${imageContextMenuPosition.x}px`,
        top: `${imageContextMenuPosition.y}px`,
      }"
      @click.stop
    >
      <button class="menu-btn copy" type="button" @click="copyContextMenuLink">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="10" height="10" rx="2" ry="2" />
          <path d="M7 15H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" />
        </svg>
        <span>复制链接</span>
      </button>
      <button class="menu-btn rename" type="button" @click="openRenameFromContextMenu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </svg>
        <span>重命名</span>
      </button>
      <button class="menu-btn danger" type="button" @click="openDeleteFromContextMenu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3,6 5,6 21,6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        <span>删除图片</span>
      </button>
    </div>

    <UiModal v-model="showDeleteConfirmModal" title="确认删除">
      <p class="modal-text">
        确定删除图片“{{ actionTargetFile?.name }}”吗？
      </p>
      <template #footer>
        <button class="modal-btn secondary" type="button" @click="closeDeleteConfirm">
          取消
        </button>
        <button class="modal-btn danger" type="button" :disabled="deleting" @click="confirmDelete">
          删除
        </button>
      </template>
    </UiModal>

    <UiModal
      v-model="showRenameModalState"
      title="重命名图片"
      :show-close="false"
      content-class="rename-modal-content"
      header-class="rename-modal-header"
      body-class="rename-modal-body"
      footer-class="rename-modal-footer"
    >
      <div class="rename-body">
        <label class="rename-label">新文件名</label>
        <UInput v-model="renameValue" placeholder="输入新的文件名" class="rename-input" />
      </div>
      <template #footer>
        <button class="rename-icon-btn cancel" type="button" aria-label="取消" @click="closeRenameModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <button
          class="rename-icon-btn save"
          type="button"
          aria-label="保存"
          :disabled="renaming"
          @click="confirmRename"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
      </template>
    </UiModal>

    <Toast v-model="show" :message="message" />
  </div>
</template>

<script setup lang="ts">
import type { FileItem } from '~~/types'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'

const { getConfig } = useConfig()
const { show, message, showToast } = useAppToast()

const {
  currentPath,
  folders,
  loading,
  imageFiles,
  fetchFiles,
  navigateTo,
  getImageUrl,
  deleteFile,
  renameFile,
} = useS3Files()

const galleryRef = ref<HTMLElement | null>(null)
const imageMenuRef = ref<HTMLElement | null>(null)
const pathMenuRef = ref<HTMLElement | null>(null)
const lightbox = shallowRef<PhotoSwipeLightbox | null>(null)
const imageDimensions = ref<Record<string, { width: number; height: number }>>({})
const masonrySpans = ref<Record<string, number>>({})
const imageContextMenuPosition = ref({ x: 0, y: 0 })
const pathMenuPosition = ref({ x: 0, y: 0 })

const currentIndex = ref(0)
const pathSelectors = ref<Array<{
  key: string
  label: string
  options: FileItem[]
}>>([])
const showPathMenu = ref(false)
const activePathMenuIndex = ref(-1)
const showImageContextMenu = ref(false)
const contextMenuTargetPath = ref('')
const suppressOpenPreviewUntil = ref(0)

const showDeleteConfirmModal = ref(false)
const deleting = ref(false)
const showRenameModalState = ref(false)
const renaming = ref(false)
const renameValue = ref('')
const actionTargetFile = ref<FileItem | null>(null)

let masonryReflowRaf: number | null = null
let pathSelectorBuildToken = 0
const folderOptionsCache = new Map<string, FileItem[]>()
let imagePressTimer: ReturnType<typeof setTimeout> | null = null
let imagePressStartX = 0
let imagePressStartY = 0
let imagePressTargetPath = ''

const hasImages = computed(() => imageFiles.value.length > 0)
const pathParts = computed(() => currentPath.value.split('/').filter(Boolean))
const currentPreviewFile = computed(() => imageFiles.value[currentIndex.value] || null)
const activePathSelector = computed(() => {
  const idx = activePathMenuIndex.value
  if (idx < 0 || idx >= pathSelectors.value.length) return null
  return pathSelectors.value[idx]
})
const contextMenuTargetFile = computed(() => {
  if (!contextMenuTargetPath.value) return null
  return imageFiles.value.find(file => file.path === contextMenuTargetPath.value) || null
})

const homeTitle = computed(() => {
  const uploadDir = getConfig()?.s3?.uploadDir?.trim()?.replace(/^\/+|\/+$/g, '') || ''
  return uploadDir ? `上传目录：${uploadDir}` : 'S3 根目录'
})

const getFolderCacheKey = (path: string) => path || '__root__'

const cloneFolders = (items: FileItem[]) => {
  return items.map(item => ({ ...item }))
}

const setCachedFolders = (path: string, entries: FileItem[]) => {
  folderOptionsCache.set(getFolderCacheKey(path), cloneFolders(entries))
}

const getCachedFolders = (path: string) => {
  return folderOptionsCache.get(getFolderCacheKey(path))
}

const fetchFoldersByPath = async (path: string) => {
  const cached = getCachedFolders(path)
  if (cached) return cloneFolders(cached)

  const config = getConfig()
  if (!config) return []

  try {
    const response = await $fetch<{
      success: boolean
      folders: FileItem[]
      files: FileItem[]
    }>('/api/s3/files', {
      method: 'GET',
      params: { path },
      headers: {
        'x-s3-config': JSON.stringify(config),
      },
    })
    const nextFolders = response.success ? response.folders : []
    setCachedFolders(path, nextFolders)
    return cloneFolders(nextFolders)
  } catch (error) {
    console.error('获取目录选项失败:', error)
    return []
  }
}

const ensureCurrentOption = (options: FileItem[], currentPathValue: string, currentName: string) => {
  if (!currentPathValue) return options
  if (options.some(item => item.path === currentPathValue)) return options
  return [
    { name: currentName, path: currentPathValue, type: 'folder' as const },
    ...options,
  ]
}

const rebuildPathSelectors = async () => {
  const token = ++pathSelectorBuildToken
  const parts = pathParts.value
  const nextSelectors: Array<{
    key: string
    label: string
    options: FileItem[]
  }> = []

  let parentPath = ''

  for (let i = 0; i < parts.length; i += 1) {
    const currentValue = parts.slice(0, i + 1).join('/')
    const siblingOptions = await fetchFoldersByPath(parentPath)
    if (token !== pathSelectorBuildToken) return

    nextSelectors.push({
      key: `level-${i}-${parentPath || 'root'}`,
      label: parts[i],
      options: ensureCurrentOption(siblingOptions, currentValue, parts[i]),
    })

    parentPath = currentValue
  }

  const childOptions = folders.value.length > 0
    ? cloneFolders(folders.value)
    : await fetchFoldersByPath(currentPath.value)

  if (token !== pathSelectorBuildToken) return

  nextSelectors.push({
    key: `level-next-${currentPath.value || 'root'}`,
    label: childOptions.length > 0 ? '选择' : '无子目录',
    options: childOptions,
  })

  pathSelectors.value = nextSelectors
}

const hidePathMenu = () => {
  showPathMenu.value = false
  activePathMenuIndex.value = -1
}

const setPathMenuPosition = async (anchorEl: HTMLElement) => {
  const rect = anchorEl.getBoundingClientRect()
  pathMenuPosition.value = {
    x: rect.left,
    y: rect.bottom + 6,
  }
  await nextTick()

  const menu = pathMenuRef.value
  if (!menu) return

  const margin = 8
  const menuRect = menu.getBoundingClientRect()
  let nextX = pathMenuPosition.value.x
  let nextY = pathMenuPosition.value.y

  if (nextX + menuRect.width + margin > window.innerWidth) {
    nextX = window.innerWidth - menuRect.width - margin
  }
  if (nextY + menuRect.height + margin > window.innerHeight) {
    nextY = window.innerHeight - menuRect.height - margin
  }
  if (nextX < margin) nextX = margin
  if (nextY < margin) nextY = margin

  pathMenuPosition.value = { x: nextX, y: nextY }
}

const togglePathMenu = async (index: number, event: MouseEvent) => {
  const selector = pathSelectors.value[index]
  if (!selector || selector.options.length === 0) {
    hidePathMenu()
    return
  }

  if (showPathMenu.value && activePathMenuIndex.value === index) {
    hidePathMenu()
    return
  }

  const anchorEl = event.currentTarget as HTMLElement | null
  if (!anchorEl) return

  activePathMenuIndex.value = index
  showPathMenu.value = true
  await setPathMenuPosition(anchorEl)
}

const selectPathMenuOption = (path: string) => {
  hidePathMenu()
  navigateTo(path)
}

const clearImagePressTimer = () => {
  if (!imagePressTimer) return
  clearTimeout(imagePressTimer)
  imagePressTimer = null
}

const hideImageContextMenu = () => {
  showImageContextMenu.value = false
  contextMenuTargetPath.value = ''
}

const setImageContextMenuPosition = async (x: number, y: number) => {
  imageContextMenuPosition.value = { x, y }
  await nextTick()

  const menu = imageMenuRef.value
  if (!menu) return

  const margin = 8
  const rect = menu.getBoundingClientRect()
  let nextX = x
  let nextY = y

  if (nextX + rect.width + margin > window.innerWidth) {
    nextX = window.innerWidth - rect.width - margin
  }
  if (nextY + rect.height + margin > window.innerHeight) {
    nextY = window.innerHeight - rect.height - margin
  }
  if (nextX < margin) nextX = margin
  if (nextY < margin) nextY = margin

  imageContextMenuPosition.value = { x: nextX, y: nextY }
}

const openImageContextMenu = async (path: string, x: number, y: number) => {
  contextMenuTargetPath.value = path
  showImageContextMenu.value = true
  await setImageContextMenuPosition(x, y)
}

const handleImageContextMenu = (index: number, event: MouseEvent) => {
  const file = imageFiles.value[index]
  if (!file) return

  event.preventDefault()
  event.stopPropagation()
  clearImagePressTimer()
  suppressOpenPreviewUntil.value = Date.now() + 320

  let x = event.clientX
  let y = event.clientY
  if (x === 0 && y === 0) {
    const currentEl = event.currentTarget as HTMLElement | null
    if (currentEl) {
      const rect = currentEl.getBoundingClientRect()
      x = rect.left + 16
      y = rect.top + 16
    }
  }

  void openImageContextMenu(file.path, x, y)
}

const handleImageTouchStart = (index: number, event: TouchEvent) => {
  const file = imageFiles.value[index]
  const touch = event.touches[0]
  if (!file || !touch) return

  imagePressTargetPath = file.path
  imagePressStartX = touch.clientX
  imagePressStartY = touch.clientY
  clearImagePressTimer()

  imagePressTimer = setTimeout(() => {
    suppressOpenPreviewUntil.value = Date.now() + 700
    imagePressTimer = null
    void openImageContextMenu(imagePressTargetPath, imagePressStartX, imagePressStartY)
  }, 420)
}

const handleImageTouchMove = (event: TouchEvent) => {
  if (!imagePressTimer) return
  const touch = event.touches[0]
  if (!touch) {
    clearImagePressTimer()
    return
  }

  const deltaX = Math.abs(touch.clientX - imagePressStartX)
  const deltaY = Math.abs(touch.clientY - imagePressStartY)
  if (deltaX > 12 || deltaY > 12) {
    clearImagePressTimer()
  }
}

const handleImageTouchEnd = () => {
  clearImagePressTimer()
}

const handleImageClick = async (index: number) => {
  if (Date.now() < suppressOpenPreviewUntil.value) return
  hideImageContextMenu()
  await openPreviewAt(index)
}

const initLightbox = () => {
  if (!process.client || lightbox.value || !galleryRef.value) return

  const instance = new PhotoSwipeLightbox({
    gallery: galleryRef.value,
    children: 'a.pswp-gallery-item',
    pswpModule: () => import('photoswipe'),
    showHideAnimationType: 'zoom',
    bgOpacity: 0.9,
    wheelToZoom: true,
  })

  instance.on('afterInit', () => {
    currentIndex.value = instance.pswp?.currIndex ?? 0
  })

  instance.on('change', () => {
    currentIndex.value = instance.pswp?.currIndex ?? 0
  })

  instance.init()
  lightbox.value = instance
}

const openPreviewAt = async (index: number) => {
  if (!lightbox.value) {
    await nextTick()
    initLightbox()
  }

  if (!lightbox.value || !galleryRef.value) return
  lightbox.value.loadAndOpen(index, { gallery: galleryRef.value })
}

const closePreview = () => {
  lightbox.value?.pswp?.close()
}

const captureDimensions = (path: string, event: Event) => {
  const img = event.target as HTMLImageElement
  if (!img?.naturalWidth || !img?.naturalHeight) return
  imageDimensions.value[path] = {
    width: img.naturalWidth,
    height: img.naturalHeight,
  }
  queueMasonryReflow()
}

const getPhotoWidth = (file: FileItem) => {
  return imageDimensions.value[file.path]?.width || 1600
}

const getPhotoHeight = (file: FileItem) => {
  return imageDimensions.value[file.path]?.height || 1200
}

const goHome = () => {
  hidePathMenu()
  navigateTo('')
}

const getMasonryStyle = (path: string) => {
  const span = masonrySpans.value[path] || 24
  return { gridRowEnd: `span ${span}` }
}

const reflowMasonry = () => {
  masonryReflowRaf = null
  const grid = galleryRef.value
  if (!grid) return

  const computed = window.getComputedStyle(grid)
  const rowHeight = Number.parseFloat(computed.getPropertyValue('grid-auto-rows')) || 8
  const gap = Number.parseFloat(computed.getPropertyValue('row-gap')) || 14
  const nextSpans: Record<string, number> = {}

  const items = grid.querySelectorAll<HTMLElement>('.masonry-item')
  items.forEach((item) => {
    const path = item.dataset.path
    if (!path) return
    const img = item.querySelector('img')
    if (!img) return

    const contentHeight = img.getBoundingClientRect().height
    const span = Math.max(1, Math.ceil((contentHeight + gap) / (rowHeight + gap)))
    nextSpans[path] = span
  })

  masonrySpans.value = nextSpans
}

const queueMasonryReflow = () => {
  if (masonryReflowRaf !== null) return
  masonryReflowRaf = window.requestAnimationFrame(reflowMasonry)
}

const copyImageLink = async (file: FileItem | null) => {
  if (!file) return

  try {
    await navigator.clipboard.writeText(getImageUrl(file))
    showToast('链接已复制')
  } catch (error) {
    showToast('复制失败')
  }
}

const copyContextMenuLink = async () => {
  await copyImageLink(contextMenuTargetFile.value)
  hideImageContextMenu()
}

const openDeleteConfirm = (file?: FileItem | null) => {
  const target = file || currentPreviewFile.value
  if (!target) return

  actionTargetFile.value = target
  hideImageContextMenu()
  closePreview()
  showDeleteConfirmModal.value = true
}

const openDeleteFromContextMenu = () => {
  openDeleteConfirm(contextMenuTargetFile.value)
}

const closeDeleteConfirm = () => {
  showDeleteConfirmModal.value = false
  actionTargetFile.value = null
}

const confirmDelete = async () => {
  if (!actionTargetFile.value) return

  deleting.value = true
  try {
    const ok = await deleteFile(actionTargetFile.value.path)
    if (ok) {
      showDeleteConfirmModal.value = false
      actionTargetFile.value = null
    }
  } finally {
    deleting.value = false
  }
}

const openRenameModal = (file?: FileItem | null) => {
  const target = file || currentPreviewFile.value
  if (!target) return

  actionTargetFile.value = target
  renameValue.value = target.name
  hideImageContextMenu()
  closePreview()
  showRenameModalState.value = true
}

const openRenameFromContextMenu = () => {
  openRenameModal(contextMenuTargetFile.value)
}

const closeRenameModal = () => {
  showRenameModalState.value = false
  actionTargetFile.value = null
  renameValue.value = ''
}

const confirmRename = async () => {
  const target = actionTargetFile.value
  const newName = renameValue.value.trim()

  if (!target) return
  if (!newName) {
    showToast('文件名不能为空')
    return
  }
  if (newName.includes('/')) {
    showToast('文件名不能包含 /')
    return
  }

  renaming.value = true
  try {
    const ok = await renameFile(target.path, newName)
    if (ok) {
      showRenameModalState.value = false
      actionTargetFile.value = null
      renameValue.value = ''
    }
  } finally {
    renaming.value = false
  }
}

watch(
  hasImages,
  async (value) => {
    if (!value) return
    await nextTick()
    initLightbox()
    queueMasonryReflow()
  },
  { immediate: true },
)

watch(
  [currentPath, folders],
  async () => {
    hidePathMenu()
    hideImageContextMenu()
    setCachedFolders(currentPath.value, folders.value)
    await rebuildPathSelectors()
  },
  { deep: false, immediate: true },
)

watch(
  [imageFiles, currentPath],
  async () => {
    if (showImageContextMenu.value && !contextMenuTargetFile.value) {
      hideImageContextMenu()
    }
    await nextTick()
    queueMasonryReflow()
  },
  { deep: false },
)

const handleGlobalPointerDown = (event: Event) => {
  const target = event.target as Node | null
  if (showPathMenu.value) {
    if (!(target && pathMenuRef.value?.contains(target))) {
      hidePathMenu()
    }
  }
  if (showImageContextMenu.value) {
    if (!(target && imageMenuRef.value?.contains(target))) {
      hideImageContextMenu()
    }
  }
}

const handleWindowScroll = () => {
  hidePathMenu()
  hideImageContextMenu()
}

const handleWindowResize = () => {
  hidePathMenu()
  hideImageContextMenu()
  if (!hasImages.value) return
  queueMasonryReflow()
}

onMounted(async () => {
  await fetchFiles()
  setCachedFolders(currentPath.value, folders.value)
  await rebuildPathSelectors()
  await nextTick()
  initLightbox()
  queueMasonryReflow()
  document.addEventListener('pointerdown', handleGlobalPointerDown, true)
  document.addEventListener('mousedown', handleGlobalPointerDown, true)
  document.addEventListener('touchstart', handleGlobalPointerDown, true)
  window.addEventListener('scroll', handleWindowScroll, true)
  window.addEventListener('resize', handleWindowResize)
})

onBeforeUnmount(() => {
  clearImagePressTimer()
  hidePathMenu()
  hideImageContextMenu()
  document.removeEventListener('pointerdown', handleGlobalPointerDown, true)
  document.removeEventListener('mousedown', handleGlobalPointerDown, true)
  document.removeEventListener('touchstart', handleGlobalPointerDown, true)
  window.removeEventListener('scroll', handleWindowScroll, true)
  window.removeEventListener('resize', handleWindowResize)
  if (masonryReflowRaf !== null) {
    window.cancelAnimationFrame(masonryReflowRaf)
    masonryReflowRaf = null
  }
  pathSelectorBuildToken += 1
  folderOptionsCache.clear()
  lightbox.value?.destroy()
  lightbox.value = null
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #faf8f5;
  padding: 24px;
}

.file-manager {
  width: min(1400px, 100%);
  margin: 0 auto;
}

.path-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  padding: 14px 16px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
}

.path-main {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
}

.path-select-chain {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: thin;
}

.home-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-btn svg {
  width: 18px;
  height: 18px;
}

.home-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}

.path-separator {
  flex: 0 0 auto;
  color: #94a3b8;
  font-size: 16px;
  line-height: 1;
}

.path-select-wrap {
  flex: 0 0 auto;
  min-width: 0;
}

.path-token {
  border: none;
  background: transparent;
  color: #334155;
  font-size: 14px;
  line-height: 1.2;
  white-space: nowrap;
  padding: 2px 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.path-token:hover {
  color: #1d4ed8;
}

.path-token:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.path-option-menu {
  position: fixed;
  z-index: 2210;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 132px;
  max-height: min(55vh, 280px);
  overflow-y: auto;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  padding: 4px 0;
  box-shadow: 0 10px 32px rgba(15, 23, 42, 0.14);
  backdrop-filter: blur(8px);
}

.path-option-btn {
  border: none;
  background: transparent;
  color: #334155;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  padding: 9px 12px;
  cursor: pointer;
}

.path-option-btn + .path-option-btn {
  border-top: 1px solid #e5e7eb;
}

.path-option-btn:hover {
  background: #f8fafc;
  color: #1d4ed8;
}

.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6b7280;
  padding: 70px 24px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty svg {
  width: 46px;
  height: 46px;
  color: #94a3b8;
}

.empty p {
  margin: 0;
  font-size: 14px;
}

.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  grid-auto-rows: 8px;
  grid-auto-flow: dense;
  gap: 14px;
}

.masonry-item {
  position: relative;
  display: block;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  background: #ffffff;
  cursor: zoom-in;
  -webkit-touch-callout: none;
}

.masonry-item img {
  display: block;
  width: 100%;
  height: auto;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
  user-select: none;
}

:global(.pswp),
:global(.pswp *),
:global(.pswp img) {
  -webkit-touch-callout: none;
  user-select: none;
}

.image-context-menu {
  position: fixed;
  z-index: 2200;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 152px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  padding: 4px 0;
  box-shadow: 0 10px 32px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(8px);
}

.menu-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  color: #334155;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 14px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.menu-btn + .menu-btn {
  border-top: 1px solid #e5e7eb;
}

.menu-btn svg {
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
}

.menu-btn.copy {
  color: #2563eb;
}

.menu-btn.rename {
  color: #0f766e;
}

.menu-btn.danger {
  color: #dc2626;
}

.menu-btn:hover {
  background: #f8fafc;
}

.menu-btn.copy:hover {
  background: #eff6ff;
}

.menu-btn.rename:hover {
  background: #ecfdf5;
}

.menu-btn.danger:hover {
  background: #fef2f2;
}

.modal-text {
  margin: 0;
  font-size: 14px;
  color: #334155;
}

.rename-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rename-label {
  margin: 0;
  font-size: 13px;
  color: #475569;
}

.rename-input {
  width: 100%;
}

.rename-input :deep(input) {
  width: 100%;
  min-height: 42px;
  border-radius: 12px !important;
  border: 1px solid #e5e7eb;
  padding: 0 12px;
}

:deep(.rename-modal-content) {
  border-radius: 12px;
}

:deep(.rename-modal-header) {
  padding: 10px 12px 4px;
}

:deep(.rename-modal-body) {
  padding: 6px 12px 4px;
}

:deep(.rename-modal-footer) {
  justify-content: flex-end;
  gap: 4px;
  padding: 2px 12px 8px;
}

.rename-icon-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease, color 0.2s ease;
}

.rename-icon-btn svg {
  width: 18px;
  height: 18px;
}

.rename-icon-btn.cancel {
  color: #64748b;
}

.rename-icon-btn.save {
  color: #2563eb;
}

.rename-icon-btn:hover {
  opacity: 0.8;
}

.rename-icon-btn:disabled {
  color: #94a3b8;
  opacity: 0.6;
  cursor: not-allowed;
}

.modal-btn {
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  border-radius: 10px;
  padding: 7px 14px;
  cursor: pointer;
}

.modal-btn.secondary {
  background: #f8fafc;
}

.modal-btn.danger {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .page-container {
    padding: 14px;
  }

  .path-main {
    gap: 8px;
  }

  .path-select-chain {
    gap: 8px;
  }

  .path-select-wrap {
    min-width: 0;
  }

  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }

  .image-context-menu {
    min-width: 132px;
  }
}
</style>
