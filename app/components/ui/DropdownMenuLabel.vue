<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DropdownMenuLabel, type DropdownMenuLabelProps } from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<DropdownMenuLabelProps & { class?: HTMLAttributes['class']; inset?: boolean }>()
</script>

<template>
  <DropdownMenuLabel :class="cn('menu-label', inset && 'menu-label--inset', props.class)">
    <slot />
  </DropdownMenuLabel>
</template>
