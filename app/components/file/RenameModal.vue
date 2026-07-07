<script setup lang="ts">
import { Check, X } from 'lucide-vue-next'

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

<template>
  <UiModal
    :model-value="modelValue"
    title="重命名"
    :show-close="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UiInput
      :model-value="nameValue"
      placeholder="输入新的文件名"
      @update:model-value="emit('update:nameValue', String($event ?? ''))"
    />

    <template #footer>
      <UiButton
        variant="outline"
        size="icon"
        aria-label="取消"
        title="取消"
        @click="emit('cancel')"
      >
        <X />
      </UiButton>
      <UiButton
        variant="default"
        size="icon"
        aria-label="确认"
        title="确认"
        :disabled="loading"
        @click="emit('confirm')"
      >
        <Check />
      </UiButton>
    </template>
  </UiModal>
</template>
