<template>
  <div class="page-container">
    <div class="config-wrapper">
      <ConfigS3ConfigForm v-model="config.s3" />
      <ConfigCompressConfigForm v-model="config.compress" />
      <ConfigRenameConfigForm v-model="config.rename" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { config, loadConfig, saveConfigToStorage } = useConfig()
const configReady = ref(false)
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

const persistConfig = async () => {
  try {
    await $fetch('/api/config', {
      method: 'POST',
      body: config.value,
    })
    saveConfigToStorage()
  } catch (error) {
    console.error('自动保存配置失败:', error)
  }
}

watch(
  config,
  () => {
    if (!configReady.value) return

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    autoSaveTimer = setTimeout(() => {
      void persistConfig()
    }, 300)
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #faf8f5;
  padding: 40px 24px;
}

.config-wrapper {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
