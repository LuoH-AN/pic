<script setup lang="ts">
import { Trash2, X } from 'lucide-vue-next'

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

<template>
  <UiModal
    :model-value="modelValue"
    title="确认删除"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="delete-modal__text">
      确定删除"{{ fileName }}"吗？
    </p>

    <template #footer>
      <UiButton
        variant="outline"
        size="icon"
        aria-label="取消"
        title="取消"
        @click="emit('update:modelValue', false)"
      >
        <X />
      </UiButton>
      <UiButton
        variant="destructive"
        size="icon"
        aria-label="删除"
        title="删除"
        :disabled="loading"
        @click="emit('confirm')"
      >
        <Trash2 />
      </UiButton>
    </template>
  </UiModal>
</template>

<style scoped>
.delete-modal__text {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--muted-foreground);
}
</style>
