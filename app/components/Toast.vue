<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="modelValue"
        class="toast"
        role="status"
        aria-live="polite"
      >
        <span>{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  message: string
}

defineProps<Props>()
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-text-primary);
  color: var(--color-toast-text);
  padding: 12px 24px;
  border-radius: 8px !important;
  font-size: 14px;
  z-index: 4200;
  box-shadow: var(--shadow-toast);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

</style>
