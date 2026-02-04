<template>
  <div class="page-container">
    <div class="config-wrapper">
      <ConfigS3ConfigForm v-model="config.s3" />
      <ConfigCompressConfigForm v-model="config.compress" />
      <ConfigRenameConfigForm v-model="config.rename" />

      <div class="action-section">
        <button class="save-btn" :disabled="isSaving" @click="handleSave">
          <svg v-if="!isSaving" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
          </svg>
          <svg v-else class="btn-icon loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
            <path d="M12 2a10 10 0 0110 10"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path>
          </svg>
        </button>
      </div>
    </div>

    <Toast v-model="show" :message="message" />
  </div>
</template>

<script setup lang="ts">
const { config, loadConfig, saveConfigToStorage } = useConfig()
const { show, message, showToast } = useAppToast()

const isSaving = ref(false)

const handleSave = async () => {
  isSaving.value = true
  try {
    await $fetch('/api/config', {
      method: 'POST',
      body: config.value,
    })
    saveConfigToStorage()
    showToast('配置已保存')
  } catch (error) {
    console.error('保存配置失败:', error)
    showToast('保存失败')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadConfig()
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

.action-section {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

.save-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1f2937;
  border: none;
  cursor: pointer;
}

.save-btn:hover:not(:disabled) {
  background: #374151;
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 20px;
  height: 20px;
  color: white;
}
</style>
