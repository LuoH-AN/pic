<template>
  <UiFormCard title="图片压缩">
    <div class="form-group">
      <label class="form-label">
        <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg>
        上传时压缩图片
      </label>
      <label class="toggle-switch">
        <input type="checkbox" v-model="model.enabled" class="toggle-input"/>
        <span class="toggle-slider"></span>
      </label>
    </div>

    <div v-if="model.enabled" class="fade-in">
      <div class="form-group">
        <label class="form-label">
          <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>
          压缩质量 (1-100)
        </label>
        <div class="quality-input-group">
          <UInput v-model.number="model.quality" type="number" min="1" max="100" size="lg" class="styled-input"/>
          <span class="quality-unit">%</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">
          <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clip-rule="evenodd"/></svg>
          输出格式
        </label>
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
  </UiFormCard>
</template>

<script setup lang="ts">
import type { CompressConfig } from '~~/types'

const model = defineModel<CompressConfig>({ required: true })
const formats = ['jpg', 'png', 'webp', 'avif'] as const
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
  display: flex;
  align-items: center;
  gap: 6px;
}

.label-icon {
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.styled-input :deep(input) {
  border-radius: 16px !important;
  border: 2px solid #e5e7eb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.styled-input :deep(input:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

/* 开关样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  cursor: pointer;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-slider {
  background-color: #3b82f6;
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

/* 质量输入框组 */
.quality-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
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
  border: 2px solid #e5e7eb;
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

/* 淡入动画 */
.fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
