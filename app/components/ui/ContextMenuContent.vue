<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  ContextMenuContent,
  type ContextMenuContentEmits,
  type ContextMenuContentProps,
  ContextMenuPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<ContextMenuContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<ContextMenuContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <ContextMenuPortal>
    <ContextMenuContent
      v-bind="forwarded"
      :class="cn('menu', props.class)"
    >
      <slot />
    </ContextMenuContent>
  </ContextMenuPortal>
</template>
