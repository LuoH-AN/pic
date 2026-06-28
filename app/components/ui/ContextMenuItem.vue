<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  ContextMenuItem,
  type ContextMenuItemEmits,
  type ContextMenuItemProps,
  useForwardPropsEmits,
} from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<ContextMenuItemProps & { class?: HTMLAttributes['class']; inset?: boolean; variant?: 'default' | 'destructive' }>()
const emits = defineEmits<ContextMenuItemEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <ContextMenuItem
    v-bind="forwarded"
    :class="cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors',
      'focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10',
      inset && 'pl-8',
      props.class,
    )"
  >
    <slot />
  </ContextMenuItem>
</template>
