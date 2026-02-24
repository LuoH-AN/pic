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
            <UInput
              :model-value="qualityInput"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              size="lg"
              class="styled-input"
              @update:model-value="handleQualityInput"
              @blur="commitQualityInput"
            />
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
const qualityInput = ref('')
const isEditingQuality = ref(false)

const toggleCompress = () => {
  model.value.enabled = !model.value.enabled
}

const normalizeQuality = (raw: unknown) => {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return 85
  return Math.max(1, Math.min(100, Math.round(parsed)))
}

const handleQualityInput = (value: string | number) => {
  isEditingQuality.value = true
  const digits = String(value ?? '').replace(/\D+/g, '').slice(0, 3)
  qualityInput.value = digits
}

const commitQualityInput = () => {
  const hasInput = qualityInput.value.trim().length > 0
  const next = hasInput ? normalizeQuality(qualityInput.value) : normalizeQuality(model.value.quality)
  model.value.quality = next
  qualityInput.value = String(next)
  isEditingQuality.value = false
}

watch(
  () => model.value.quality,
  (quality) => {
    if (isEditingQuality.value) return
    const next = normalizeQuality(quality)
    if (next !== quality) {
      model.value.quality = next
    }
    qualityInput.value = String(next)
  },
  { immediate: true },
)

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
  color: var(--color-text-secondary);
}

.status-btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 12px !important;
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.status-btn.enabled {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.styled-input :deep(input) {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 12px !important;
  border: 1px solid var(--color-border);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.styled-input :deep(input:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-ring);
  outline: none;
}

.styled-input {
  width: 100%;
}

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
  color: var(--color-text-muted);
}

.format-options {
  display: flex;
  gap: 12px;
}

.format-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-surface);
}

.format-option:hover {
  border-color: var(--color-border-strong);
  background: var(--color-surface-alt);
}

.format-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.format-radio {
  display: none;
}

.format-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.format-option.active .format-name {
  color: var(--color-primary);
}

.compress-tip {
  margin: 16px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-muted);
}
</style>
