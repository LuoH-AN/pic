<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { SeparatorRoot, type SeparatorRootProps } from 'reka-ui'
import { cn } from '~/lib/utils'

const props = withDefaults(
  defineProps<SeparatorRootProps & { class?: HTMLAttributes['class'] }>(),
  {
    orientation: 'horizontal',
    decorative: true,
  },
)
</script>

<template>
  <SeparatorRoot
    :orientation="orientation"
    :decorative="decorative"
    :class="cn('separator', props.class)"
  />
</template>
