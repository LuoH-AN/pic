<template>
  <div class="file-manager">
    <div class="file-toolbar">
      <div class="file-toolbar__left">
        <UiButton
          v-if="canGoUp"
          variant="ghost"
          size="icon-sm"
          title="返回上级"
          aria-label="返回上级"
          @click="emit('navigate', parentPath)"
        >
          <ChevronLeft />
        </UiButton>
        <span class="file-toolbar__count">
          {{ folders.length }} 个文件夹 · {{ files.length }} 个文件
        </span>
      </div>
    </div>

    <FileList
      ref="fileListRef"
      :loading="loading"
      :folders="folders"
      :files="files"
      :image-loaded="imageLoaded"
      :image-dimensions="imageDimensions"
      :get-image-url="getImageUrl"
      @navigate="handleNavigate"
      @image-click="handleImageClick"
      @item-action="handleItemAction"
      @image-load="handleImageLoad"
    />
  </div>
</template>

<script setup lang="ts">
import type { FileItem } from '~~/types'
import { ChevronLeft } from 'lucide-vue-next'
import FileList from '~/components/file/FileList.vue'

interface Props {
  currentPath: string
  folders: FileItem[]
  loading: boolean
  files: FileItem[]
  imageLoaded: Record<string, boolean>
  imageDimensions: Record<string, { width: number; height: number }>
  getImageUrl: (file: FileItem) => string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  navigate: [path: string]
  'image-click': [index: number]
  'item-action': [payload: { type: 'open' | 'copy' | 'download' | 'rename' | 'delete'; item: FileItem }]
  'image-load': [path: string, event: Event]
}>()

// 返回上级：去掉路径最后一段。
const parentPath = computed(() =>
  props.currentPath.split('/').filter(Boolean).slice(0, -1).join('/'),
)
const canGoUp = computed(() => Boolean(props.currentPath))

const fileListRef = ref<{ getGalleryEl: () => HTMLElement | null } | null>(null)

const handleNavigate = (path: string) => emit('navigate', path)
const handleImageClick = (index: number) => emit('image-click', index)
const handleItemAction = (payload: { type: 'open' | 'copy' | 'download' | 'rename' | 'delete'; item: FileItem }) => {
  emit('item-action', payload)
}
const handleImageLoad = (path: string, event: Event) => emit('image-load', path, event)

defineExpose({
  getGalleryEl: () => fileListRef.value?.getGalleryEl() || null,
})
</script>

<style scoped>
.file-manager {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-inline: auto;
  width: 100%;
}
@media (min-width: 1400px) {
  .file-manager {
    width: 1400px;
  }
}

.file-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0 0.25rem;
}
.file-toolbar__left {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
}
.file-toolbar__count {
  font-size: var(--text-xs);
  color: var(--muted-foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
