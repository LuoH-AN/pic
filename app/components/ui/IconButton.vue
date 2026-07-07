<script setup lang="ts">
import { Loader } from 'lucide-vue-next'

interface Props {
  variant?: 'default' | 'upload' | 'copy' | 'delete'
  disabled?: boolean
  loading?: boolean
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  disabled: false,
  loading: false,
  title: '',
})
</script>

<template>
  <UiButton
    variant="ghost"
    size="icon"
    class="icon-btn"
    :data-variant="props.variant"
    :disabled="props.disabled || props.loading"
    :title="props.title"
    :aria-label="props.title"
  >
    <Loader v-if="props.loading" class="spin" />
    <slot v-else />
  </UiButton>
</template>
