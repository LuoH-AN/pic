<template>
  <div class="breadcrumb">
    <div class="breadcrumb-item" @click="$emit('navigate', '')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
      <span>根目录</span>
    </div>
    <template v-for="(part, index) in pathParts" :key="index">
      <svg class="breadcrumb-separator" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9,18 15,12 9,6"/>
      </svg>
      <div
        class="breadcrumb-item"
        @click="$emit('navigate', pathParts.slice(0, index + 1).join('/'))"
      >
        <span>{{ part }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  path: string
}

const props = defineProps<Props>()
defineEmits<{
  navigate: [path: string]
}>()

const pathParts = computed(() => {
  if (!props.path) return []
  return props.path.split('/').filter(Boolean)
})
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #374151;
}

.breadcrumb-item:hover {
  background: #f3f4f6;
}

.breadcrumb-item svg {
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.breadcrumb-separator {
  width: 16px;
  height: 16px;
  color: #9ca3af;
}
</style>
