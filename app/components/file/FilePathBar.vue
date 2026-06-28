<template>
  <section
    class="flex items-center gap-2.5 rounded-xl border bg-card px-4 py-3.5 shadow-sm"
  >
    <UiButton
      variant="outline"
      size="icon"
      class="size-9 shrink-0"
      title="返回根目录"
      aria-label="返回根目录"
      @click="emit('navigate', '')"
    >
      <Home class="size-4" />
    </UiButton>

    <div class="flex min-w-0 flex-1 items-center gap-2.5 overflow-x-auto max-md:gap-2">
      <template v-for="(selector, index) in pathSelectors" :key="selector.key">
        <ChevronRight class="size-3.5 shrink-0 text-muted-foreground" />

        <UiDropdownMenu>
          <UiDropdownMenuTrigger as-child>
            <UiButton
              variant="ghost"
              size="sm"
              :disabled="selector.options.length === 0"
              class="h-auto shrink-0 px-1.5 py-1 font-normal text-secondary-foreground data-[state=open]:text-primary hover:text-primary"
            >
              {{ selector.label }}
            </UiButton>
          </UiDropdownMenuTrigger>

          <UiDropdownMenuContent class="max-h-[min(55vh,280px)] min-w-[132px] overflow-y-auto">
            <UiDropdownMenuItem
              v-for="folder in selector.options"
              :key="folder.path"
              @select="emit('navigate', folder.path)"
            >
              {{ folder.name }}
            </UiDropdownMenuItem>
          </UiDropdownMenuContent>
        </UiDropdownMenu>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FileItem } from '~~/types'
import { ChevronRight, Home } from 'lucide-vue-next'

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

let pathSelectorBuildToken = 0
const folderOptionsCache = new Map<string, FileItem[]>()

const pathParts = computed(() => props.currentPath.split('/').filter(Boolean))

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

watch(
  () => props.currentPath,
  () => {
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
})

onBeforeUnmount(() => {
  pathSelectorBuildToken += 1
  folderOptionsCache.clear()
})
</script>
