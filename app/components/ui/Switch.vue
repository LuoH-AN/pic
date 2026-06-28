<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  SwitchRoot as RekaSwitchRoot,
  SwitchThumb as RekaSwitchThumb,
} from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<{
  modelValue?: boolean
  defaultValue?: boolean
  disabled?: boolean
  id?: string
  name?: string
  class?: HTMLAttributes['class']
}>()
const emits = defineEmits<{ 'update:modelValue': [payload: boolean] }>()
</script>

<template>
  <RekaSwitchRoot
    :model-value="modelValue"
    :default-value="defaultValue"
    :disabled="disabled"
    :id="id"
    :name="name"
    :class="cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-xs transition-colors',
      'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
      props.class,
    )"
    @update:model-value="emits('update:modelValue', $event as boolean)"
  >
    <RekaSwitchThumb
      class="pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
    />
  </RekaSwitchRoot>
</template>
