<template>
  <div class="form-card">
    <h2 v-if="title" class="card-title">{{ title }}</h2>
    <div class="form-section">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
}

defineProps<Props>()
</script>

<style scoped>
.form-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
