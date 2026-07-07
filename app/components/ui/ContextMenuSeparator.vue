<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { ContextMenuSeparator, type ContextMenuSeparatorProps } from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<ContextMenuSeparatorProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <ContextMenuSeparator :class="cn('menu-separator', props.class)" />
</template>
