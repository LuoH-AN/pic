<template>
  <div v-if="loading" class="loading">
    <div class="loading-spinner"></div>
    <span>加载中...</span>
  </div>

  <div v-else-if="imageFiles.length === 0" class="empty">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
    <p>当前目录暂无图片</p>
  </div>

  <div v-else id="file-gallery" ref="galleryRef" class="wall">
    <a
      v-for="(file, index) in imageFiles"
      :key="file.path"
      class="wall-item pswp-gallery-item"
      :class="{ loaded: isLoaded(file.path) }"
      :style="!isLoaded(file.path) ? getPlaceholderStyle(file) : undefined"
      :href="getImageUrl(file)"
      :data-pswp-width="getPhotoWidth(file)"
      :data-pswp-height="getPhotoHeight(file)"
      :data-pswp-alt="file.name"
      @click.prevent="$emit('image-click', index)"
      @contextmenu.prevent="$emit('image-context', index, $event)"
    >
      <div v-if="!isLoaded(file.path)" class="image-loading"></div>
      <img
        :src="getImageUrl(file)"
        :alt="file.name"
        :class="{ loaded: isLoaded(file.path) }"
        draggable="false"
        loading="lazy"
        decoding="async"
        @load="$emit('image-load', file.path, $event)"
      />
    </a>
  </div>
</template>

<script setup lang="ts">
import type { FileItem } from '~~/types'

interface Props {
  loading: boolean
  imageFiles: FileItem[]
  imageLoaded: Record<string, boolean>
  imageDimensions: Record<string, { width: number; height: number }>
  getImageUrl: (file: FileItem) => string
}

const props = defineProps<Props>()
const galleryRef = ref<HTMLElement | null>(null)

defineExpose({
  getGalleryEl: () => galleryRef.value,
})

defineEmits<{
  'image-click': [index: number]
  'image-context': [index: number, event: MouseEvent]
  'image-load': [path: string, event: Event]
}>()

const isLoaded = (path: string) => Boolean(props.imageLoaded[path])

const getPhotoWidth = (file: FileItem) => {
  return props.imageDimensions[file.path]?.width || 1600
}

const getPhotoHeight = (file: FileItem) => {
  return props.imageDimensions[file.path]?.height || 1200
}

const getPlaceholderStyle = (file: FileItem) => {
  return {
    aspectRatio: `${getPhotoWidth(file)} / ${getPhotoHeight(file)}`,
    minHeight: '96px',
  }
}
</script>

<style scoped>
.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-muted);
  padding: 72px 24px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty svg {
  width: 46px;
  height: 46px;
  color: var(--color-text-muted);
}

.empty p {
  margin: 0;
  font-size: 14px;
}

.wall {
  columns: 4 220px;
  column-gap: 14px;
}

.wall-item {
  position: relative;
  display: inline-block;
  width: 100%;
  margin-bottom: 14px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  background: var(--color-surface-alt);
  cursor: zoom-in;
  break-inside: avoid;
}

.wall-item.loaded {
  min-height: 0;
}

.image-loading {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    var(--color-shimmer-start) 30%,
    var(--color-shimmer-mid) 45%,
    var(--color-shimmer-start) 60%
  );
  background-size: 220% 100%;
  animation: imageShimmer 1.3s linear infinite;
  pointer-events: none;
}

.wall-item img {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0;
  transition: opacity 0.2s ease;
  user-select: none;
  -webkit-user-drag: none;
}

.wall-item img.loaded {
  opacity: 1;
}

@keyframes imageShimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}

@media (max-width: 1024px) {
  .wall {
    columns: 3 180px;
  }
}

@media (max-width: 768px) {
  .wall {
    columns: 2 140px;
    column-gap: 10px;
  }

  .wall-item {
    margin-bottom: 10px;
  }
}
</style>
