<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<{
  type?: string
  placeholder?: string
  disabled?: boolean
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
}>()
const emits = defineEmits<{ 'update:modelValue': [payload: string | number] }>()

const model = computed({
  get: () => props.modelValue,
  set: value => emits('update:modelValue', value as string | number),
})
</script>

<template>
  <input
    v-model="model"
    :type="type ?? 'text'"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="cn('input', props.class)"
  >
</template>
