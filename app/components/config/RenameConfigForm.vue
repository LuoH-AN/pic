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
            <svg class="strategy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span class="strategy-name">时间戳</span>
          </div>
        </label>
        <label
          class="strategy-option"
          :class="{ active: model.strategy === 'random' }"
        >
          <input type="radio" v-model="model.strategy" value="random" class="strategy-radio"/>
          <div class="strategy-content">
            <svg class="strategy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
            <span class="strategy-name">随机字符</span>
          </div>
        </label>
        <label
          class="strategy-option"
          :class="{ active: model.strategy === 'custom' }"
        >
          <input type="radio" v-model="model.strategy" value="custom" class="strategy-radio"/>
          <div class="strategy-content">
            <svg class="strategy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span class="strategy-name">自定义</span>
          </div>
        </label>
      </div>
    </div>

    <div v-if="model.strategy === 'custom'" class="form-group fade-in">
      <label class="form-label">自定义命名格式</label>
      <UInput v-model="model.customFormat" placeholder="{Y}{m}{d}-{filename}" size="lg" class="styled-input"/>
    </div>

    <div class="form-group">
      <label class="form-label">占位符说明</label>
      <table class="placeholder-table">
        <thead>
          <tr>
            <th>占位符</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>{Y}</td><td>年份 (2022)</td></tr>
          <tr><td>{y}</td><td>两位数年份 (22)</td></tr>
          <tr><td>{m}</td><td>月份 (01-12)</td></tr>
          <tr><td>{d}</td><td>日期 (01-31)</td></tr>
          <tr><td>{h}</td><td>小时 (00-23)</td></tr>
          <tr><td>{i}</td><td>分钟 (00-59)</td></tr>
          <tr><td>{s}</td><td>秒 (00-59)</td></tr>
          <tr><td>{ms}</td><td>毫秒 (000-999)</td></tr>
          <tr><td>{timestamp}</td><td>时间戳 (毫秒)</td></tr>
          <tr><td>{uuid}</td><td>唯一字符串</td></tr>
          <tr><td>{md5}</td><td>随机 md5</td></tr>
          <tr><td>{md5-16}</td><td>随机 md5 前 16 位</td></tr>
          <tr><td>{str-number}</td><td>随机 number 位字符串</td></tr>
          <tr><td>{filename}</td><td>原始文件名</td></tr>
        </tbody>
      </table>
    </div>
  </UiFormCard>
</template>

<script setup lang="ts">
import type { RenameConfig } from '~~/types'

const model = defineModel<RenameConfig>({ required: true })
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
  color: #374151;
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
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  flex: 1;
  justify-content: center;
}

.strategy-option:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.strategy-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.strategy-radio {
  display: none;
}

.strategy-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.strategy-icon {
  width: 18px;
  height: 18px;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.strategy-option.active .strategy-icon {
  color: #3b82f6;
}

.strategy-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.strategy-option.active .strategy-name {
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

.placeholder-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.placeholder-table th,
.placeholder-table td {
  border: 1px solid #e5e7eb;
  padding: 8px;
  text-align: left;
}

.placeholder-table th {
  background-color: #f9fafb;
  font-weight: 500;
}
</style>
