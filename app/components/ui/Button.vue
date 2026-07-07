<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Primitive, type PrimitiveProps } from 'reka-ui'
import { cn } from '~/lib/utils'

interface Props extends PrimitiveProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  variant: 'default',
  size: 'default',
})

// Map props → modifier classes defined in assets/css/components.css.
// Keeping the prop API stable so callers (pages / feature components)
// don't need to change how they use <UiButton>.
const variantClass = computed(() => {
  switch (props.variant) {
    case 'destructive': return 'btn--destructive'
    case 'outline': return 'btn--outline'
    case 'secondary': return 'btn--secondary'
    case 'ghost': return 'btn--ghost'
    case 'link': return 'btn--link'
    default: return 'btn--primary'
  }
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'btn--sm'
    case 'lg': return 'btn--lg'
    case 'icon': return 'btn--icon'
    case 'icon-sm': return 'btn--icon-sm'
    default: return ''
  }
})
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="cn('btn', variantClass, sizeClass, props.class)"
  >
    <slot />
  </Primitive>
</template>
