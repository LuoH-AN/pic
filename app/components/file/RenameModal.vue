<template>
  <UiModal
    :model-value="modelValue"
    title="重命名图片"
    :show-close="false"
    content-class="rename-modal-content"
    header-class="rename-modal-header"
    body-class="rename-modal-body"
    footer-class="rename-modal-footer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="rename-body">
      <label class="rename-label">新文件名</label>
      <UInput
        :model-value="nameValue"
        placeholder="输入新的文件名"
        class="rename-input"
        @update:model-value="emit('update:nameValue', String($event ?? ''))"
      />
    </div>
    <template #footer>
      <button class="rename-icon-btn cancel" type="button" aria-label="取消" @click="emit('cancel')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>
      <button class="rename-icon-btn save" type="button" aria-label="确认" :disabled="loading" @click="emit('confirm')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  nameValue: string
  loading: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:nameValue': [value: string]
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.rename-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rename-label {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.rename-input {
  width: 100%;
}

.rename-input :deep(input) {
  width: 100%;
  min-height: 42px;
  border-radius: 12px !important;
  border: 1px solid var(--color-border);
  padding: 0 12px;
}

:deep(.rename-modal-content) {
  border-radius: 12px;
}

:deep(.rename-modal-header) {
  padding: 10px 12px 4px;
}

:deep(.rename-modal-body) {
  padding: 6px 12px 4px;
}

:deep(.rename-modal-footer) {
  justify-content: flex-end;
  gap: 4px;
  padding: 2px 12px 8px;
}

.rename-icon-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.rename-icon-btn svg {
  width: 16px;
  height: 16px;
}

.rename-icon-btn.cancel {
  color: var(--color-text-muted);
}

.rename-icon-btn.save {
  color: var(--color-primary);
}

.rename-icon-btn:disabled {
  color: var(--color-text-muted);
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
