<template>
  <div class="page-container">
    <div class="config-wrapper">
      <ConfigCompressConfigForm v-model="config.compress" />
      <ConfigRenameConfigForm v-model="config.rename" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { config, loadConfig, saveConfigToStorage } = useConfig()
const configReady = ref(false)
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

const persistConfig = () => {
  saveConfigToStorage()
}

watch(
  config,
  () => {
    if (!configReady.value) return

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    autoSaveTimer = setTimeout(() => {
      persistConfig()
    }, 400)
  },
  { deep: true },
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
.page-container {
  min-height: calc(100vh - var(--bottom-nav-offset, 96px));
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-page-bg);
  padding: var(--space-10) var(--space-6);
}

.config-wrapper {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
</style>
