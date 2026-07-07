<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  DropdownMenuContent,
  type DropdownMenuContentEmits,
  type DropdownMenuContentProps,
  DropdownMenuPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import { cn } from '~/lib/utils'

const props = withDefaults(
  defineProps<DropdownMenuContentProps & { class?: HTMLAttributes['class'] }>(),
  { sideOffset: 6 },
)
const emits = defineEmits<DropdownMenuContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      v-bind="forwarded"
      :side-offset="sideOffset"
      :class="cn('menu', props.class)"
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
