<template>
  <div class="page-container">
    <FileManagerContent
      ref="fileManagerRef"
      :current-path="currentPath"
      :folders="folders"
      :loading="loading"
      :image-files="imageFiles"
      :image-loaded="imageLoaded"
      :image-dimensions="imageDimensions"
      :get-image-url="getImageUrl"
      @navigate="handleNavigate"
      @image-click="handleImageClick"
      @image-context="handleImageContextMenu"
      @image-load="handleImageLoaded"
    />

    <FileActionsLayer
      ref="actionLayerRef"
      v-model:show-image-context-menu="showImageContextMenu"
      v-model:show-delete-confirm-modal="showDeleteConfirmModal"
      v-model:show-rename-modal-state="showRenameModalState"
      v-model:rename-value="renameValue"
      :image-context-menu-position="imageContextMenuPosition"
      :action-target-file="actionTargetFile"
      :deleting="deleting"
      :renaming="renaming"
      @copy="copyContextMenuLink"
      @rename="openRenameModal(contextMenuTargetFile)"
      @delete="openDeleteConfirm(contextMenuTargetFile)"
      @confirm-delete="confirmDelete"
      @confirm-rename="confirmRename"
      @cancel-rename="closeRenameModal"
    />

    <Toast v-model="show" :message="message" />
  </div>
</template>

<script setup lang="ts">
import type { FileItem } from '~~/types'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'
import FileManagerContent from '~/components/file/FileManagerContent.vue'
import FileActionsLayer from '~/components/file/FileActionsLayer.vue'

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

const fileManagerRef = ref<{ getGalleryEl: () => HTMLElement | null } | null>(null)
const actionLayerRef = ref<{ getMenuEl: () => HTMLElement | null } | null>(null)
const lightbox = shallowRef<PhotoSwipeLightbox | null>(null)
const currentIndex = ref(0)
const imageLoaded = ref<Record<string, boolean>>({})
const imageDimensions = ref<Record<string, { width: number; height: number }>>({})
const imageContextMenuPosition = ref({ x: 0, y: 0 })
const showImageContextMenu = ref(false)
const contextMenuTargetPath = ref('')

const showDeleteConfirmModal = ref(false)
const deleting = ref(false)
const showRenameModalState = ref(false)
const renaming = ref(false)
const renameValue = ref('')
const actionTargetFile = ref<FileItem | null>(null)

const currentPreviewFile = computed(() => imageFiles.value[currentIndex.value] || null)
const contextMenuTargetFile = computed(() => {
  if (!contextMenuTargetPath.value) return null
  return imageFiles.value.find(file => file.path === contextMenuTargetPath.value) || null
})

const hideImageContextMenu = () => {
  showImageContextMenu.value = false
  contextMenuTargetPath.value = ''
}

const validateRenameInput = (rawName: string) => {
  const next = rawName.trim()
  if (!next) return { valid: false, message: '文件名不能为空' }
  if (next === '.' || next === '..') return { valid: false, message: '文件名不合法' }
  if (/[\\/\u0000-\u001F\u007F<>:"|?*]/.test(next)) return { valid: false, message: '文件名包含非法字符' }
  if (next.length > 255) return { valid: false, message: '文件名过长' }
  return { valid: true, value: next }
}

const setImageContextMenuPosition = async (x: number, y: number) => {
  imageContextMenuPosition.value = { x, y }
  await nextTick()
  const menuEl = actionLayerRef.value?.getMenuEl()
  if (!menuEl) return

  const margin = 8
  const rect = menuEl.getBoundingClientRect()
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

const initLightbox = () => {
  if (!import.meta.client || lightbox.value) return
  const galleryEl = fileManagerRef.value?.getGalleryEl()
  if (!galleryEl) return

  const instance = new PhotoSwipeLightbox({
    gallery: galleryEl,
    children: 'a.pswp-gallery-item',
    pswpModule: () => import('photoswipe'),
    showHideAnimationType: 'zoom',
    bgOpacity: 0.9,
    bgClickAction: 'close',
    imageClickAction: 'close',
    tapAction: 'close',
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
  const galleryEl = fileManagerRef.value?.getGalleryEl()
  if (!galleryEl || !lightbox.value) return
  lightbox.value.loadAndOpen(index, { gallery: galleryEl })
}

const closePreview = () => {
  lightbox.value?.pswp?.close()
}

const handleNavigate = async (path: string) => {
  hideImageContextMenu()
  await navigateTo(path)
}

const handleImageLoaded = (path: string, event: Event) => {
  imageLoaded.value[path] = true
  const img = event.target as HTMLImageElement | null
  if (!img?.naturalWidth || !img?.naturalHeight) return
  imageDimensions.value[path] = {
    width: img.naturalWidth,
    height: img.naturalHeight,
  }
}

const handleImageClick = async (index: number) => {
  hideImageContextMenu()
  await openPreviewAt(index)
}

const handleImageContextMenu = (index: number, event: MouseEvent) => {
  const file = imageFiles.value[index]
  if (!file) return
  event.preventDefault()
  event.stopPropagation()
  void openImageContextMenu(file.path, event.clientX, event.clientY)
}

const copyImageLink = async (file: FileItem | null) => {
  if (!file) return
  try {
    await navigator.clipboard.writeText(getImageUrl(file))
    showToast('链接已复制')
  } catch {
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

const closeRenameModal = () => {
  showRenameModalState.value = false
  actionTargetFile.value = null
  renameValue.value = ''
}

const confirmRename = async () => {
  const target = actionTargetFile.value
  if (!target) return

  const result = validateRenameInput(renameValue.value)
  if (!result.valid) {
    showToast(result.message || '文件名不合法')
    return
  }

  renaming.value = true
  try {
    const ok = await renameFile(target.path, result.value || '')
    if (ok) {
      showRenameModalState.value = false
      actionTargetFile.value = null
      renameValue.value = ''
    }
  } finally {
    renaming.value = false
  }
}

const handleGlobalPointerDown = (event: Event) => {
  const target = event.target as Node | null
  const menuEl = actionLayerRef.value?.getMenuEl() || null
  if (showImageContextMenu.value && !(target && menuEl?.contains(target))) {
    hideImageContextMenu()
  }
}

watch(
  imageFiles,
  async () => {
    const nextLoaded: Record<string, boolean> = {}
    const nextDimensions: Record<string, { width: number; height: number }> = {}
    imageFiles.value.forEach((file) => {
      if (imageLoaded.value[file.path]) {
        nextLoaded[file.path] = true
      }
      const dimensions = imageDimensions.value[file.path]
      if (dimensions) {
        nextDimensions[file.path] = dimensions
      }
    })
    imageLoaded.value = nextLoaded
    imageDimensions.value = nextDimensions

    if (showImageContextMenu.value && !contextMenuTargetFile.value) {
      hideImageContextMenu()
    }
    await nextTick()
    initLightbox()
  },
  { deep: false },
)

watch(showDeleteConfirmModal, (visible) => {
  if (!visible && !deleting.value) {
    actionTargetFile.value = null
  }
})

watch(showRenameModalState, (visible) => {
  if (!visible && !renaming.value) {
    actionTargetFile.value = null
    renameValue.value = ''
  }
})

onMounted(async () => {
  await fetchFiles()
  await nextTick()
  initLightbox()
  document.addEventListener('pointerdown', handleGlobalPointerDown, true)
  window.addEventListener('scroll', hideImageContextMenu, true)
  window.addEventListener('resize', hideImageContextMenu)
})

onBeforeUnmount(() => {
  hideImageContextMenu()
  document.removeEventListener('pointerdown', handleGlobalPointerDown, true)
  window.removeEventListener('scroll', hideImageContextMenu, true)
  window.removeEventListener('resize', hideImageContextMenu)
  lightbox.value?.destroy()
  lightbox.value = null
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: var(--color-page-bg);
  padding: var(--space-6) var(--space-6) calc(var(--space-6) + var(--bottom-nav-offset, 96px));
}

@media (max-width: 768px) {
  .page-container {
    padding: var(--space-4) var(--space-4) calc(var(--space-4) + var(--bottom-nav-offset, 92px));
  }
}
</style>
