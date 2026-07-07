<template>
  <div class="config-page">
    <div class="config-page__inner">
      <ConfigCompressConfigForm v-model="config.compress" />
      <ConfigRenameConfigForm v-model="config.rename" :extension="previewExt" />

      <footer class="config-footer">
        <RefreshCw class="config-footer__icon" :class="{ spin: isSaving }" />
        <span>{{ isSaving ? '正在保存…' : '所有更改已自动保存' }}</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'

const { config, loadConfig, saveConfigToStorage } = useConfig()
const configReady = ref(false)
const isSaving = ref(false)
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

const persistConfig = () => {
  saveConfigToStorage()
  isSaving.value = false
}

watch(
  config,
  () => {
    if (!configReady.value) return

    isSaving.value = true
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    autoSaveTimer = setTimeout(persistConfig, 400)
  },
  { deep: true },
)

// Preview extension reflects the pipeline: compressed output uses the chosen
// format, otherwise the original extension is kept (sampled as jpg).
const previewExt = computed(() =>
  config.value.compress.enabled ? config.value.compress.format : 'jpg',
)

onMounted(() => {
  loadConfig()
  configReady.value = true
})

onBeforeUnmount(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
})
</script>

<style scoped>
.config-page {
  display: flex;
  justify-content: center;
  min-height: calc(100vh - var(--bottom-nav-offset));
  padding: var(--page-pad-y) var(--page-pad-x);
}

.config-page__inner {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 35rem;
}

.config-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: var(--text-xs);
  color: var(--muted-foreground);
}
.config-footer__icon {
  width: 0.875rem;
  height: 0.875rem;
}
</style>
