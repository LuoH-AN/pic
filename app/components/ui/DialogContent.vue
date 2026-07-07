<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import { X } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = defineProps<DialogContentProps & { class?: HTMLAttributes['class']; showClose?: boolean }>()
const emits = defineEmits<DialogContentEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DialogPortal>
    <DialogOverlay class="dialog-overlay" />
    <DialogContent
      v-bind="forwarded"
      :class="cn('dialog-content', props.class)"
    >
      <slot />

      <DialogClose
        v-if="showClose !== false"
        class="dialog-close"
      >
        <X />
        <span class="sr-only">关闭</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
