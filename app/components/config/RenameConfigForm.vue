<template>
  <UiFormCard title="重命名配置">
    <div class="form-group">
      <label class="form-label">重命名策略</label>
      <div class="strategy-options">
        <label
          class="strategy-option"
          :class="{ active: model.strategy === 'timestamp' }"
        >
          <input type="radio" v-model="model.strategy" value="timestamp" class="strategy-radio"/>
          <div class="strategy-content">
            <span class="strategy-name">时间戳</span>
          </div>
        </label>
        <label
          class="strategy-option"
          :class="{ active: model.strategy === 'random' }"
        >
          <input type="radio" v-model="model.strategy" value="random" class="strategy-radio"/>
          <div class="strategy-content">
            <span class="strategy-name">随机字符</span>
          </div>
        </label>
        <label
          class="strategy-option"
          :class="{ active: model.strategy === 'custom' }"
        >
          <input type="radio" v-model="model.strategy" value="custom" class="strategy-radio"/>
          <div class="strategy-content">
            <span class="strategy-name">自定义</span>
          </div>
        </label>
      </div>
    </div>

    <Transition name="expand-panel">
      <div v-if="model.strategy === 'custom'" class="custom-config">
        <div class="form-group">
          <label class="form-label">自定义命名格式</label>
          <UInput v-model="model.customFormat" placeholder="album/{Y}/{m}/{filename}" size="lg" class="styled-input"/>
        </div>
      </div>
    </Transition>
  </UiFormCard>
</template>

<script setup lang="ts">
import type { RenameConfig } from '~~/types'

const model = defineModel<RenameConfig>({ required: true })

watch(
  () => model.value.customFormat,
  (value) => {
    if (model.value.strategy !== 'custom') return
    const sanitized = (value || '')
      .replace(/\\/g, '/')
      .replace(/[\u0000-\u001F\u007F]/g, '')
    if (sanitized !== value) {
      model.value.customFormat = sanitized
    }
  },
)
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
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

/* 重命名策略选择样式 */
.strategy-options {
  display: flex;
  gap: 12px;
}

.strategy-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-surface);
  flex: 1;
  justify-content: center;
}

.strategy-option:hover {
  border-color: var(--color-border-strong);
  background: var(--color-surface-alt);
}

.strategy-option.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
}

.strategy-radio {
  display: none;
}

.strategy-content {
  display: flex;
  justify-content: center;
}

.strategy-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.strategy-option.active .strategy-name {
  color: var(--color-primary);
}

.custom-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
