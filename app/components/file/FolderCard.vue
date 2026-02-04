<template>
  <div class="folder-card" @click="$emit('click')">
    <div class="folder-cover">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
      </svg>
    </div>
    <div class="folder-name">{{ name }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
}

defineProps<Props>()
defineEmits<{
  click: []
}>()
</script>

<style scoped>
.folder-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  background: #fefce8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.folder-card:hover {
  background: #fef9c3;
  transform: translateY(-2px);
}

.folder-cover {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef9c3;
  border-radius: 12px;
  color: #ca8a04;
  margin-bottom: 12px;
}

.folder-cover svg {
  width: 36px;
  height: 36px;
}

.folder-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
</style>
