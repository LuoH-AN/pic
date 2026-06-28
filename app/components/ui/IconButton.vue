<script setup lang="ts">
import { Loader } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

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
    :disabled="props.disabled || props.loading"
    :title="props.title"
    :aria-label="props.title"
    :class="cn(
      props.variant === 'upload' && 'text-primary hover:text-primary',
      props.variant === 'copy' && 'text-success hover:text-success',
      props.variant === 'delete' && 'text-destructive hover:text-destructive',
    )"
  >
    <Loader v-if="props.loading" class="size-4 animate-spin" />
    <slot v-else />
  </UiButton>
</template>
