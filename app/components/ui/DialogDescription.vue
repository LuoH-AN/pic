<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DialogDescription, type DialogDescriptionProps } from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DialogDescription :as="props.as" :as-child="props.asChild" :class="cn('dialog-description', props.class)">
    <slot />
  </DialogDescription>
</template>
