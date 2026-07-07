<template>
  <div class="file-page">
    <FileManagerContent
      ref="fileManagerRef"
      :current-path="currentPath"
      :folders="folders"
      :loading="loading"
      :files="files"
      :image-loaded="imageLoaded"
      :image-dimensions="imageDimensions"
      :get-image-url="getImageUrl"
      @navigate="handleNavigate"
      @image-click="handleImageClick"
      @item-action="handleItemAction"
      @image-load="handleImageLoaded"
    />

    <FileActionsLayer
      v-model:show-delete-confirm-modal="showDeleteConfirmModal"
      v-model:show-rename-modal-state="showRenameModalState"
      v-model:rename-value="renameValue"
      :action-target-file="actionTargetFile"
      :deleting="deleting"
      :renaming="renaming"
      @confirm-delete="confirmDelete"
      @confirm-rename="confirmRename"
      @cancel-rename="closeRenameModal"
    />
  </div>
</template>

<script setup lang="ts">
import type { FileItem } from '~~/types'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import 'photoswipe/style.css'
import FileManagerContent from '~/components/file/FileManagerContent.vue'
import FileActionsLayer from '~/components/file/FileActionsLayer.vue'
import { copyText } from '~/utils/clipboard'

const { showToast } = useAppToast()
const {
  currentPath,
  folders,
  loading,
  files,
  imageFiles,
  fetchFiles,
  navigateTo,
  getImageUrl,
  deleteFile,
  renameFile,
} = useS3Files()

const fileManagerRef = ref<{ getGalleryEl: () => HTMLElement | null } | null>(null)
const lightbox = shallowRef<PhotoSwipeLightbox | null>(null)
let boundGalleryEl: HTMLElement | null = null
const currentIndex = ref(0)
const imageLoaded = ref<Record<string, boolean>>({})
const imageDimensions = ref<Record<string, { width: number; height: number }>>({})

const showDeleteConfirmModal = ref(false)
const deleting = ref(false)
const showRenameModalState = ref(false)
const renaming = ref(false)
const renameValue = ref('')
const actionTargetFile = ref<FileItem | null>(null)

const currentPreviewFile = computed(() => imageFiles.value[currentIndex.value] || null)

// Reject backslash, forward slash, the printable reserved chars, and any ASCII
// control / DEL code point. Control chars are checked by code point to avoid
// embedding raw control bytes in the source.
const ILLEGAL_NAME_CHARS = /[\\/<>:"|?*]/
const isControlCode = (ch: string) => {
  const code = ch.charCodeAt(0)
  return code <= 0x1F || code === 0x7F
}

const validateRenameInput = (rawName: string) => {
  const next = rawName.trim()
  if (!next) return { valid: false, message: '文件名不能为空' }
  if (next === '.' || next === '..') return { valid: false, message: '文件名不合法' }
  if (ILLEGAL_NAME_CHARS.test(next) || [...next].some(isControlCode)) {
    return { valid: false, message: '文件名包含非法字符' }
  }
  if (next.length > 255) return { valid: false, message: '文件名过长' }
  return { valid: true, value: next }
}

const initLightbox = () => {
  if (!import.meta.client) return
  const galleryEl = fileManagerRef.value?.getGalleryEl()
  if (!galleryEl) return
  // 画廊元素未变化时无需重建（PhotoSwipe 会在打开时重新读取子项）。
  if (lightbox.value && boundGalleryEl === galleryEl) return
  // 空目录会卸载 #file-gallery，再有图时是一个新元素，需要销毁旧实例重新绑定。
  if (lightbox.value) {
    lightbox.value.destroy()
    lightbox.value = null
  }

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
  boundGalleryEl = galleryEl
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
  await openPreviewAt(index)
}

const handleItemAction = (payload: { type: 'open' | 'copy' | 'download' | 'rename' | 'delete'; item: FileItem }) => {
  const { type, item } = payload
  if (type === 'open') {
    if (item.type === 'folder') return handleNavigate(item.path)
    return openFileUrl(item)
  }
  if (type === 'download') return openFileUrl(item)
  if (type === 'copy') return copyLink(item)
  if (type === 'rename') return openRenameModal(item)
  return openDeleteConfirm(item)
}

const openFileUrl = (file: FileItem | null) => {
  if (!file || !import.meta.client) return
  window.open(getImageUrl(file), '_blank', 'noopener')
}

const copyLink = async (file: FileItem | null) => {
  if (!file) return
  const ok = await copyText(getImageUrl(file))
  showToast(ok ? '链接已复制' : '复制失败')
}

const openDeleteConfirm = (file?: FileItem | null) => {
  const target = file || currentPreviewFile.value
  if (!target) return
  actionTargetFile.value = target
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
})

onBeforeUnmount(() => {
  lightbox.value?.destroy()
  lightbox.value = null
  boundGalleryEl = null
})
</script>

<style scoped>
.file-page {
  min-height: 100vh;
  padding: 1.5rem 1.5rem calc(1.5rem + var(--bottom-nav-offset));
}
@media (max-width: 767px) {
  .file-page {
    padding: 1rem 1rem calc(1.5rem + var(--bottom-nav-offset));
  }
}
</style>
