<template>
  <UiFormCard
    title="图片压缩"
    :collapsed="!model.enabled && !isPanelLeaving"
  >
    <template #header-right>
      <button
        class="status-btn"
        :class="{ enabled: model.enabled }"
        type="button"
        @click="toggleCompress"
      >
        {{ model.enabled ? '已启用' : '未启用' }}
      </button>
    </template>

    <Transition
      name="expand-panel"
      @before-leave="handleBeforeLeave"
      @after-leave="handleAfterLeave"
    >
      <div v-if="model.enabled">
        <div class="form-group">
          <label class="form-label">压缩质量 (1-100)</label>
          <div class="quality-input-group">
            <UInput v-model.number="model.quality" type="number" min="1" max="100" size="lg" class="styled-input"/>
            <span class="quality-unit">%</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">输出格式</label>
          <div class="format-options">
            <label
              v-for="format in formats"
              :key="format"
              class="format-option"
              :class="{ active: model.format === format }"
            >
              <input type="radio" v-model="model.format" :value="format" class="format-radio"/>
              <span class="format-name">{{ format.toUpperCase() }}</span>
            </label>
          </div>
        </div>
      </div>
    </Transition>
  </UiFormCard>
</template>

<script setup lang="ts">
import type { CompressConfig } from '~~/types'

const model = defineModel<CompressConfig>({ required: true })
const formats = ['jpg', 'png', 'webp', 'avif'] as const
const isPanelLeaving = ref(false)

const toggleCompress = () => {
  model.value.enabled = !model.value.enabled
}

const handleBeforeLeave = () => {
  isPanelLeaving.value = true
}

const handleAfterLeave = () => {
  isPanelLeaving.value = false
}
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group + .form-group {
  margin-top: 20px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.status-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 12px !important;
  border: 1px solid #e5e7eb;
  background: #faf8f5;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.status-btn.enabled {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #2563eb;
}

.styled-input :deep(input) {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 12px !important;
  border: 1px solid #e5e7eb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.styled-input :deep(input:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
  outline: none;
}

.styled-input {
  width: 100%;
}

/* 质量输入框组 */
.quality-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quality-input-group .styled-input {
  flex: 1;
  min-width: 0;
}

.quality-unit {
  font-size: 14px;
  color: #6b7280;
}

/* 格式选项 */
.format-options {
  display: flex;
  gap: 12px;
}

.format-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.format-option:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.format-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.format-radio {
  display: none;
}

.format-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.format-option.active .format-name {
  color: #3b82f6;
}

</style>
