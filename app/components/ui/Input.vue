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
    :class="cn(
      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none',
      'placeholder:text-muted-foreground',
      'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      props.class,
    )"
  >
</template>
