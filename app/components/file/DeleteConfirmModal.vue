<template>
  <UiModal :model-value="modelValue" title="确认删除" @update:model-value="emit('update:modelValue', $event)">
    <p class="modal-text">确定删除图片“{{ fileName }}”吗？</p>
    <template #footer>
      <button class="modal-icon-btn cancel" type="button" aria-label="取消" title="取消" @click="emit('update:modelValue', false)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      </button>
      <button class="modal-icon-btn danger" type="button" aria-label="删除" title="删除" :disabled="loading" @click="emit('confirm')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  fileName: string
  loading: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()
</script>

<style scoped>
.modal-text {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.modal-icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.modal-icon-btn svg {
  width: 16px;
  height: 16px;
}

.modal-icon-btn.danger {
  color: var(--color-danger);
}

.modal-icon-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
