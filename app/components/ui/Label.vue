<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Label as RekaLabel, type LabelProps } from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <RekaLabel
    :for="props.for"
    :class="cn(
      'inline-flex items-center gap-2 text-sm font-medium leading-none select-none',
      'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      props.class,
    )"
  >
    <slot />
  </RekaLabel>
</template>
