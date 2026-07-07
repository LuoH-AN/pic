<script setup lang="ts">
import { ToastProvider, ToastRoot, ToastViewport } from 'reka-ui'

const { toasts, dismiss } = useAppToast()

// reka-ui fires update:open=false after its auto-dismiss timer or a swipe;
// let the exit animation play, then drop the record from the store.
const handleOpenChange = (id: number, open: boolean) => {
  if (open) return
  setTimeout(() => dismiss(id), 250)
}
</script>

<template>
  <ToastProvider :duration="3000" swipe-direction="right">
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      :duration="toast.duration"
      :default-open="true"
      class="toast"
      @update:open="handleOpenChange(toast.id, $event)"
    >
      <span>{{ toast.message }}</span>
    </ToastRoot>

    <ToastViewport class="toast-viewport" />
  </ToastProvider>
</template>
