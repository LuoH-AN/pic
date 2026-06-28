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
      class="group pointer-events-auto relative flex items-center justify-center gap-2 rounded-full border bg-card px-5 py-2.5 text-sm text-card-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0"
      @update:open="handleOpenChange(toast.id, $event)"
    >
      <span>{{ toast.message }}</span>
    </ToastRoot>

    <ToastViewport
      class="pointer-events-none fixed bottom-10 left-1/2 z-[4200] flex max-h-screen w-full -translate-x-1/2 flex-col items-center gap-2 p-4 outline-none"
    />
  </ToastProvider>
</template>
