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
          <p class="format-tip">支持使用 <code>/</code> 分目录，例如 <code>travel/{Y}/{m}/{filename}</code></p>
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
                <tr><td>{Y}</td><td>年份 (例如 2026)</td></tr>
                <tr><td>{y}</td><td>两位数年份 (例如 26)</td></tr>
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

.format-tip {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
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

.placeholder-table-wrap {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-surface);
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
  color: var(--color-text-secondary);
}

.placeholder-table th + th,
.placeholder-table td + td {
  border-left: 1px solid var(--color-border);
}

.placeholder-table tbody tr + tr td {
  border-top: 1px solid var(--color-border);
}

.placeholder-table tbody tr:nth-child(even) td {
  background: var(--color-surface-alt);
}

.placeholder-table tbody tr:hover td {
  background: var(--color-hover);
}

.placeholder-table td:first-child {
  width: 36%;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  color: var(--color-primary);
}

.placeholder-table th {
  background-color: var(--color-page-bg);
  color: var(--color-text-primary);
  font-weight: 600;
}
</style>
