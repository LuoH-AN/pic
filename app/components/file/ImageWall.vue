<script setup lang="ts">
import type { FileItem } from '~~/types'
import { Images, Link, Loader2, Pencil, Trash2 } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

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
  'image-action': [payload: { type: 'copy' | 'rename' | 'delete'; index: number }]
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

<template>
  <div
    v-if="loading"
    class="flex flex-col items-center justify-center gap-3 px-6 py-20 text-muted-foreground"
  >
    <Loader2 class="size-8 animate-spin text-primary" />
    <span>加载中...</span>
  </div>

  <div
    v-else-if="imageFiles.length === 0"
    class="flex flex-col items-center justify-center gap-3 px-6 py-20 text-muted-foreground"
  >
    <Images class="size-11" />
    <p class="m-0 text-sm">当前目录暂无图片</p>
  </div>

  <div
    v-else
    id="file-gallery"
    ref="galleryRef"
    class="columns-[4_220px] [column-gap:14px] max-lg:columns-[3_180px] max-md:columns-[2_140px] max-md:[column-gap:10px]"
  >
    <UiContextMenu v-for="(file, index) in imageFiles" :key="file.path">
      <UiContextMenuTrigger as-child>
        <a
          class="mb-3.5 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-lg border bg-secondary transition-colors hover:border-foreground/30 hover:bg-muted max-md:mb-2.5"
          :style="!isLoaded(file.path) ? getPlaceholderStyle(file) : undefined"
          :href="getImageUrl(file)"
          :data-pswp-width="getPhotoWidth(file)"
          :data-pswp-height="getPhotoHeight(file)"
          :data-pswp-alt="file.name"
          @click.prevent="$emit('image-click', index)"
        >
          <div
            v-if="!isLoaded(file.path)"
            class="absolute inset-0 animate-pulse bg-secondary"
          />
          <img
            :src="getImageUrl(file)"
            :alt="file.name"
            draggable="false"
            loading="lazy"
            decoding="async"
            :class="cn('block h-auto w-full opacity-0 transition-opacity duration-200 select-none', isLoaded(file.path) && 'opacity-100')"
            @load="$emit('image-load', file.path, $event)"
          >
        </a>
      </UiContextMenuTrigger>

      <UiContextMenuContent>
        <UiContextMenuItem @select="$emit('image-action', { type: 'copy', index })">
          <Link class="size-4 text-muted-foreground" />
          <span>复制链接</span>
        </UiContextMenuItem>
        <UiContextMenuItem @select="$emit('image-action', { type: 'rename', index })">
          <Pencil class="size-4 text-muted-foreground" />
          <span>重命名</span>
        </UiContextMenuItem>
        <UiContextMenuSeparator />
        <UiContextMenuItem variant="destructive" @select="$emit('image-action', { type: 'delete', index })">
          <Trash2 class="size-4" />
          <span>删除图片</span>
        </UiContextMenuItem>
      </UiContextMenuContent>
    </UiContextMenu>
  </div>
</template>
