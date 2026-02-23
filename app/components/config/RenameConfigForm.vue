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
          <UInput v-model="model.customFormat" placeholder="{Y}{m}{d}-{filename}" size="lg" class="styled-input"/>
        </div>

        <div class="form-group">
          <label class="form-label">占位符说明</label>
          <div class="placeholder-table-wrap">
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
        </div>
      </div>
    </Transition>
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
  border: 1px solid #e5e7eb;
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
  justify-content: center;
}

.strategy-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.strategy-option.active .strategy-name {
  color: #3b82f6;
}

.custom-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.placeholder-table-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
}

.placeholder-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 12px;
}

.placeholder-table th,
.placeholder-table td {
  padding: 10px 12px;
  text-align: left;
  color: #475569;
}

.placeholder-table th + th,
.placeholder-table td + td {
  border-left: 1px solid #e5e7eb;
}

.placeholder-table tbody tr + tr td {
  border-top: 1px solid #e5e7eb;
}

.placeholder-table tbody tr:nth-child(even) td {
  background: #fcfcfd;
}

.placeholder-table tbody tr:hover td {
  background: #f8fafc;
}

.placeholder-table td:first-child {
  width: 36%;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  color: #1d4ed8;
}

.placeholder-table th {
  background-color: #faf8f5;
  color: #334155;
  font-weight: 600;
}
</style>
