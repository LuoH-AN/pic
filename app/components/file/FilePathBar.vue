<template>
  <section class="path-card">
    <div class="path-main">
      <button class="home-btn" type="button" title="返回根目录" @click="emit('navigate', '')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
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

  <div
    v-if="showPathMenu && activePathSelector"
    ref="pathMenuRef"
    class="path-option-menu"
    :style="{ left: `${pathMenuPosition.x}px`, top: `${pathMenuPosition.y}px` }"
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
</template>

<script setup lang="ts">
import type { FileItem } from '~~/types'

interface Props {
  currentPath: string
  folders: FileItem[]
}

interface PathSelector {
  key: string
  label: string
  options: FileItem[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  navigate: [path: string]
}>()

const pathSelectors = ref<PathSelector[]>([])
const showPathMenu = ref(false)
const activePathMenuIndex = ref(-1)
const pathMenuPosition = ref({ x: 0, y: 0 })
const pathMenuRef = ref<HTMLElement | null>(null)

let pathSelectorBuildToken = 0
const folderOptionsCache = new Map<string, FileItem[]>()

const pathParts = computed(() => props.currentPath.split('/').filter(Boolean))

const activePathSelector = computed(() => {
  const idx = activePathMenuIndex.value
  if (idx < 0 || idx >= pathSelectors.value.length) return null
  return pathSelectors.value[idx]
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

  try {
    const response = await $fetch<{
      success: boolean
      folders: FileItem[]
      files: FileItem[]
    }>('/api/s3/files', {
      method: 'GET',
      params: { path },
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
  const nextSelectors: PathSelector[] = []

  let parentPath = ''

  for (let i = 0; i < parts.length; i += 1) {
    const currentValue = parts.slice(0, i + 1).join('/')
    const part = parts[i] || ''
    const siblingOptions = await fetchFoldersByPath(parentPath)
    if (token !== pathSelectorBuildToken) return

    nextSelectors.push({
      key: `level-${i}-${parentPath || 'root'}`,
      label: part,
      options: ensureCurrentOption(siblingOptions, currentValue, part),
    })

    parentPath = currentValue
  }

  const childOptions = props.folders.length > 0
    ? cloneFolders(props.folders)
    : await fetchFoldersByPath(props.currentPath)

  if (token !== pathSelectorBuildToken) return

  nextSelectors.push({
    key: `level-next-${props.currentPath || 'root'}`,
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
  emit('navigate', path)
}

const handleGlobalPointerDown = (event: Event) => {
  const target = event.target as Node | null
  if (showPathMenu.value && !(target && pathMenuRef.value?.contains(target))) {
    hidePathMenu()
  }
}

watch(
  () => props.currentPath,
  () => {
    hidePathMenu()
    void rebuildPathSelectors()
  },
)

watch(
  () => props.folders,
  (folders) => {
    setCachedFolders(props.currentPath, folders)
    void rebuildPathSelectors()
  },
  { deep: false },
)

onMounted(() => {
  setCachedFolders(props.currentPath, props.folders)
  void rebuildPathSelectors()
  document.addEventListener('pointerdown', handleGlobalPointerDown, true)
  window.addEventListener('scroll', hidePathMenu, true)
  window.addEventListener('resize', hidePathMenu)
})

onBeforeUnmount(() => {
  pathSelectorBuildToken += 1
  folderOptionsCache.clear()
  hidePathMenu()
  document.removeEventListener('pointerdown', handleGlobalPointerDown, true)
  window.removeEventListener('scroll', hidePathMenu, true)
  window.removeEventListener('resize', hidePathMenu)
})
</script>

<style scoped>
.path-card {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
  padding: 14px 16px;
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
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  display: inline-flex;
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
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.path-separator {
  flex: 0 0 auto;
  color: var(--color-text-muted);
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
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.2;
  white-space: nowrap;
  padding: 2px 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.path-token:hover {
  color: var(--color-primary-strong);
}

.path-token:disabled {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.path-option-menu {
  position: fixed;
  z-index: 2400;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 132px;
  max-height: min(55vh, 280px);
  overflow-y: auto;
  border: 1px solid var(--color-border);
  background: color-mix(in oklab, var(--color-surface) 96%, transparent);
  border-radius: 12px;
  padding: 4px 0;
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(8px);
}

.path-option-btn {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  padding: 9px 12px;
  cursor: pointer;
}

.path-option-btn + .path-option-btn {
  border-top: 1px solid var(--color-border);
}

.path-option-btn:hover {
  background: var(--color-hover);
  color: var(--color-primary-strong);
}

@media (max-width: 768px) {
  .path-main {
    gap: 8px;
  }

  .path-select-chain {
    gap: 8px;
  }
}
</style>
