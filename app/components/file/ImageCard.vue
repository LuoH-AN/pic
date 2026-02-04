<template>
  <div class="image-card" @click="$emit('click')">
    <img :src="src" :alt="name" class="image-preview" />
    <div class="image-overlay">
      <span class="image-name">{{ name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  src: string
  name: string
}

defineProps<Props>()
defineEmits<{
  click: []
}>()
</script>

<style scoped>
.image-card {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #f3f4f6;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-card:hover .image-preview {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-card:hover .image-overlay {
  opacity: 1;
}

.image-name {
  font-size: 12px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
</style>
