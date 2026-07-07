<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Label as RekaLabel, type LabelProps } from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <RekaLabel
    :for="props.for"
    :class="cn('label', props.class)"
  >
    <slot />
  </RekaLabel>
</template>
