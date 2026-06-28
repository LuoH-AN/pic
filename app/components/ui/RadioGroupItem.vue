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
    :class="cn(
      'aspect-square size-4 rounded-full border border-primary text-primary shadow-xs',
      'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      props.class,
    )"
  >
    <RadioGroupIndicator class="flex items-center justify-center">
      <Circle class="size-2 fill-current text-current" />
    </RadioGroupIndicator>
  </RekaRadioGroupItem>
</template>
