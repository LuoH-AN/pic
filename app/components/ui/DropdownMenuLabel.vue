<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DropdownMenuLabel, type DropdownMenuLabelProps } from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<DropdownMenuLabelProps & { class?: HTMLAttributes['class']; inset?: boolean }>()
</script>

<template>
  <DropdownMenuLabel
    :class="cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', inset && 'pl-8', props.class)"
  />
</template>
