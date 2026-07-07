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
    :class="cn('switch', props.class)"
    @update:model-value="emits('update:modelValue', $event as boolean)"
  >
    <RekaSwitchThumb class="switch-thumb" />
  </RekaSwitchRoot>
</template>
