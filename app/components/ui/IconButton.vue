<template>
  <button
    class="icon-btn"
    :class="[variant, { loading }]"
    :disabled="disabled || loading"
    :title="title"
  >
    <slot v-if="!loading" />
    <svg v-else class="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
      <path d="M12 2a10 10 0 0110 10"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'upload' | 'copy' | 'delete'
  disabled?: boolean
  loading?: boolean
  title?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  disabled: false,
  loading: false,
  title: '',
})
</script>

<style scoped>
.icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg, var(--color-surface));
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn :deep(svg) {
  width: 18px;
  height: 18px;
}

.icon-btn:hover:not(:disabled) {
  background: var(--card-bg, var(--color-surface));
  filter: brightness(0.96);
}

.icon-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-btn.upload :deep(svg) {
  color: var(--color-primary);
}

.icon-btn.copy :deep(svg) {
  color: var(--color-success);
}

.icon-btn.delete :deep(svg) {
  color: var(--color-danger);
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
