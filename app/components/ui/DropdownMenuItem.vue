<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  DropdownMenuItem,
  type DropdownMenuItemEmits,
  type DropdownMenuItemProps,
  useForwardPropsEmits,
} from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<DropdownMenuItemProps & { class?: HTMLAttributes['class']; inset?: boolean; variant?: 'default' | 'destructive' }>()
const emits = defineEmits<DropdownMenuItemEmits>()

// Strip our own props before forwarding so reka-ui doesn't render them as
// plain DOM attributes. `variant` is re-bound below as `data-variant`,
// which the .menu-item[data-variant=...] selectors match.
const delegatedProps = computed(() => {
  const { class: _omit, inset: _inset, variant: _variant, ...delegated } = props
  return delegated
})
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DropdownMenuItem
    v-bind="forwarded"
    :data-variant="variant"
    :class="cn('menu-item', inset && 'menu-item--inset', props.class)"
  >
    <slot />
  </DropdownMenuItem>
</template>
