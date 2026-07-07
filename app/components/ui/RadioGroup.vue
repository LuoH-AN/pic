<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  RadioGroupRoot,
  type RadioGroupRootEmits,
  type RadioGroupRootProps,
  useForwardPropsEmits,
} from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<RadioGroupRootProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<RadioGroupRootEmits>()

const delegatedProps = computed(() => {
  const { class: _omit, ...rest } = props
  return rest
})
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <RadioGroupRoot v-bind="forwarded" :class="cn('radio-group', props.class)">
    <slot />
  </RadioGroupRoot>
</template>
