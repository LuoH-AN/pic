<script setup lang="ts">
import type { FileItem } from '~~/types'
import {
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileText,
  FileVideo,
  Folder,
  FolderOpen,
  Images,
  Link,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-vue-next'
import { formatDate, formatFileSize } from '~/utils/format'
import { getFileKind, isImageFile } from '~/utils/fileType'

type ItemKind = 'folder' | 'image' | 'file'
type ActionType = 'open' | 'copy' | 'download' | 'rename' | 'delete'

interface DisplayItem extends FileItem {
  kind: ItemKind
}

interface Props {
  loading: boolean
  folders: FileItem[]
  files: FileItem[]
  imageLoaded: Record<string, boolean>
  imageDimensions: Record<string, { width: number; height: number }>
  getImageUrl: (file: FileItem) => string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  navigate: [path: string]
  'image-click': [index: number]
  'item-action': [payload: { type: ActionType; item: FileItem }]
  'image-load': [path: string, event: Event]
}>()

const galleryRef = ref<HTMLElement | null>(null)

defineExpose({
  getGalleryEl: () => galleryRef.value,
})

// AList 风格：文件夹在前，文件在后，各自按名称排序。
const items = computed<DisplayItem[]>(() => {
  const folders = props.folders.map(folder => ({ ...folder, kind: 'folder' as const }))
  const files = props.files.map(file => ({
    ...file,
    kind: (isImageFile(file.name) ? 'image' : 'file') as ItemKind,
  }))
  return [...folders, ...files]
})

// PhotoSwipe 以“仅图片”的顺序打开，需要把文件在列表里的位置映射到图片序号。
const imageIndexOfPath = computed(() => {
  const map = new Map<string, number>()
  let index = 0
  for (const file of props.files) {
    if (isImageFile(file.name)) {
      map.set(file.path, index)
      index += 1
    }
  }
  return map
})

const KIND_ICON: Record<string, unknown> = {
  archive: FileArchive,
  audio: FileAudio,
  code: FileCode,
  pdf: FileText,
  text: FileText,
  other: File,
  video: FileVideo,
}

const getIcon = (item: DisplayItem) => {
  if (item.kind === 'folder') return Folder
  if (item.kind === 'image') return null
  return KIND_ICON[getFileKind(item.name)] || File
}

const getPhotoWidth = (item: DisplayItem) => props.imageDimensions[item.path]?.width || 1600
const getPhotoHeight = (item: DisplayItem) => props.imageDimensions[item.path]?.height || 1200
const isLoaded = (path: string) => Boolean(props.imageLoaded[path])

const sizeText = (item: DisplayItem) => (item.kind === 'folder' ? '—' : formatFileSize(item.size))
const dateText = (item: DisplayItem) => (item.kind === 'folder' ? '—' : formatDate(item.lastModified))

const activate = (item: DisplayItem) => {
  if (item.kind === 'folder') {
    emit('navigate', item.path)
    return
  }
  if (item.kind === 'image') {
    const index = imageIndexOfPath.value.get(item.path)
    if (index != null) emit('image-click', index)
    return
  }
  emit('item-action', { type: 'open', item })
}
</script>

<template>
  <div
    v-if="loading"
    class="file-state"
  >
    <Loader2 class="spin file-state__icon" />
    <span>加载中...</span>
  </div>

  <div
    v-else-if="items.length === 0"
    class="file-state"
  >
    <Images class="file-state__icon file-state__icon--empty" />
    <p class="file-state__text">
      当前目录为空
    </p>
  </div>

  <!-- PhotoSwipe 绑定此容器（#file-gallery），仅收集 a.pswp-gallery-item -->
  <div
    v-else
    id="file-gallery"
    ref="galleryRef"
    class="file-view"
  >
    <div
      class="file-view__head"
      aria-hidden="true"
    >
      <span class="file-view__col file-view__col--name">名称</span>
      <span class="file-view__col file-view__col--size">大小</span>
      <span class="file-view__col file-view__col--date">修改时间</span>
    </div>

    <UiContextMenu
      v-for="item in items"
      :key="item.path"
    >
      <UiContextMenuTrigger as-child>
        <div
          class="file-row"
          :data-kind="item.kind"
        >
          <div class="file-row__name">
            <a
              v-if="item.kind === 'image'"
              class="file-row__thumb pswp-gallery-item"
              :href="getImageUrl(item)"
              :data-pswp-width="getPhotoWidth(item)"
              :data-pswp-height="getPhotoHeight(item)"
              :data-pswp-alt="item.name"
              :style="!isLoaded(item.path) ? { aspectRatio: `${getPhotoWidth(item)} / ${getPhotoHeight(item)}` } : undefined"
              :title="item.name"
              @click.prevent="activate(item)"
            >
              <img
                :src="getImageUrl(item)"
                :alt="item.name"
                draggable="false"
                loading="lazy"
                decoding="async"
                class="file-row__img"
                :class="{ 'file-row__img--loaded': isLoaded(item.path) }"
                @load="emit('image-load', item.path, $event)"
              >
            </a>
            <button
              v-else
              type="button"
              class="file-row__thumb file-row__thumb--icon"
              :title="item.name"
              @click="activate(item)"
            >
              <component :is="getIcon(item)" class="file-row__icon" />
            </button>
            <button
              type="button"
              class="file-row__link"
              :title="item.name"
              @click="activate(item)"
            >
              {{ item.name }}
            </button>
          </div>
          <span class="file-row__size">{{ sizeText(item) }}</span>
          <span class="file-row__date">{{ dateText(item) }}</span>
        </div>
      </UiContextMenuTrigger>

      <UiContextMenuContent>
        <template v-if="item.kind === 'folder'">
          <UiContextMenuItem @select="emit('item-action', { type: 'open', item })">
            <FolderOpen class="file-menu-icon" />
            <span>打开</span>
          </UiContextMenuItem>
        </template>
        <template v-else>
          <UiContextMenuItem @select="emit('item-action', { type: 'open', item })">
            <ExternalLink class="file-menu-icon" />
            <span>在新标签打开</span>
          </UiContextMenuItem>
          <UiContextMenuItem @select="emit('item-action', { type: 'download', item })">
            <Download class="file-menu-icon" />
            <span>下载</span>
          </UiContextMenuItem>
          <UiContextMenuItem @select="emit('item-action', { type: 'copy', item })">
            <Link class="file-menu-icon" />
            <span>复制直链</span>
          </UiContextMenuItem>
          <UiContextMenuSeparator />
          <UiContextMenuItem @select="emit('item-action', { type: 'rename', item })">
            <Pencil class="file-menu-icon" />
            <span>重命名</span>
          </UiContextMenuItem>
          <UiContextMenuItem variant="destructive" @select="emit('item-action', { type: 'delete', item })">
            <Trash2 />
            <span>删除</span>
          </UiContextMenuItem>
        </template>
      </UiContextMenuContent>
    </UiContextMenu>
  </div>
</template>

<style scoped>
/* ── 通用状态（加载 / 空目录） ────────────────────────── */
.file-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 5rem 1.5rem;
  color: var(--muted-foreground);
}
.file-state__icon {
  width: 2rem;
  height: 2rem;
  color: var(--primary);
}
.file-state__icon--empty {
  width: 2.75rem;
  height: 2.75rem;
  color: var(--muted-foreground);
}
.file-state__text {
  margin: 0;
  font-size: var(--text-sm);
}

/* ── 列表视图 ─────────────────────────────────────────── */
.file-view {
  display: flex;
  flex-direction: column;
}
.file-view__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px 150px;
  gap: 0.75rem;
  padding: 0.5rem 0.875rem;
  font-size: var(--text-xs);
  color: var(--muted-foreground);
  border-bottom: 1px solid var(--border);
}
.file-view__col--size,
.file-view__col--date {
  text-align: right;
}
.file-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px 150px;
  gap: 0.75rem;
  align-items: center;
  padding: 0.5rem 0.875rem;
  border-bottom: 1px solid var(--border);
  cursor: default;
  transition: background-color var(--duration-fast) ease;
}
.file-row:hover {
  background: var(--muted);
}
.file-row__name {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}
.file-row__thumb {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-sm);
  background: var(--secondary);
  border: 1px solid var(--border);
  cursor: pointer;
  padding: 0;
}
.file-row__thumb--icon {
  border: none;
  background: transparent;
}
.file-row__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 200ms ease;
}
.file-row__img--loaded {
  opacity: 1;
}
.file-row__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--muted-foreground);
}
.file-row[data-kind='folder'] .file-row__icon {
  color: var(--primary);
}
.file-row__link {
  min-width: 0;
  text-align: left;
  font-size: var(--text-sm);
  color: var(--foreground);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-row__link:hover {
  color: var(--primary);
}
.file-row__size,
.file-row__date {
  font-size: var(--text-xs);
  color: var(--muted-foreground);
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 639px) {
  /* 移动端隐藏“修改时间”，名称收窄 */
  .file-view__head,
  .file-row {
    grid-template-columns: minmax(0, 1fr) 72px;
  }
  .file-view__col--date,
  .file-row__date {
    display: none;
  }
}

/* 右键菜单里的前置图标（teleport 出去，但 scope id 仍跟随）。 */
.file-menu-icon {
  color: var(--muted-foreground);
}
</style>
