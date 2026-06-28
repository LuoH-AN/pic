<template>
  <div class="flex min-h-[calc(100vh-var(--bottom-nav-offset,96px))] items-center justify-center px-6 py-10">
    <div class="flex w-full max-w-[560px] flex-col gap-6">
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
