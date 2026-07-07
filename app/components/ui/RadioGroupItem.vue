<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  RadioGroupIndicator,
  RadioGroupItem as RekaRadioGroupItem,
  type RadioGroupItemProps,
} from 'reka-ui'
import { Circle } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = defineProps<RadioGroupItemProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _omit, ...rest } = props
  return rest
})
</script>

<template>
  <RekaRadioGroupItem
    v-bind="delegatedProps"
    :class="cn('radio-item', props.class)"
  >
    <RadioGroupIndicator class="radio-indicator">
      <Circle />
    </RadioGroupIndicator>
  </RekaRadioGroupItem>
</template>
