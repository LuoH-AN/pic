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
    <p class="m-0 text-sm text-muted-foreground">确定删除图片"{{ fileName }}"吗？</p>

    <template #footer>
      <UiButton
        variant="outline"
        size="icon"
        aria-label="取消"
        title="取消"
        @click="emit('update:modelValue', false)"
      >
        <X class="size-4" />
      </UiButton>
      <UiButton
        variant="destructive"
        size="icon"
        aria-label="删除"
        title="删除"
        :disabled="loading"
        @click="emit('confirm')"
      >
        <Trash2 class="size-4" />
      </UiButton>
    </template>
  </UiModal>
</template>
