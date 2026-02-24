<template>
  <div class="file-manager">
    <FilePathBar
      :current-path="currentPath"
      :folders="folders"
      @navigate="handleNavigate"
    />

    <ImageWall
      ref="imageWallRef"
      :loading="loading"
      :image-files="imageFiles"
      :image-loaded="imageLoaded"
      :image-dimensions="imageDimensions"
      :get-image-url="getImageUrl"
      @image-click="handleImageClick"
      @image-context="handleImageContext"
      @image-load="handleImageLoad"
    />
  </div>
</template>

<script setup lang="ts">
import type { FileItem } from '~~/types'
import FilePathBar from '~/components/file/FilePathBar.vue'
import ImageWall from '~/components/file/ImageWall.vue'

interface Props {
  currentPath: string
  folders: FileItem[]
  loading: boolean
  imageFiles: FileItem[]
  imageLoaded: Record<string, boolean>
  imageDimensions: Record<string, { width: number; height: number }>
  getImageUrl: (file: FileItem) => string
}

defineProps<Props>()
const emit = defineEmits<{
  navigate: [path: string]
  'image-click': [index: number]
  'image-context': [index: number, event: MouseEvent]
  'image-load': [path: string, event: Event]
}>()

const imageWallRef = ref<{ getGalleryEl: () => HTMLElement | null } | null>(null)

const handleNavigate = (path: string) => {
  emit('navigate', path)
}

const handleImageClick = (index: number) => {
  emit('image-click', index)
}

const handleImageContext = (index: number, event: MouseEvent) => {
  emit('image-context', index, event)
}

const handleImageLoad = (path: string, event: Event) => {
  emit('image-load', path, event)
}

defineExpose({
  getGalleryEl: () => imageWallRef.value?.getGalleryEl() || null,
})
</script>

<style scoped>
.file-manager {
  width: min(1400px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
