<template>
  <div class="form-card" :class="{ collapsed }">
    <div v-if="title || slots['header-right']" class="card-header">
      <h2 v-if="title" class="card-title">{{ title }}</h2>
      <div v-if="slots['header-right']" class="card-header-right">
        <slot name="header-right" />
      </div>
    </div>
    <div class="form-section">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  collapsed?: boolean
}

withDefaults(defineProps<Props>(), {
  collapsed: false,
})
const slots = useSlots()
</script>

<style scoped>
.form-card {
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  padding: 20px 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
  transition: margin-bottom 220ms ease;
}

.form-card.collapsed .card-header {
  margin-bottom: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.card-header-right {
  display: flex;
  align-items: center;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
