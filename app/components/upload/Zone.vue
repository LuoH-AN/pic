<template>
  <div
    class="upload-zone"
    :class="{ 'drag-over': isDragOver }"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden-input"
      @change="handleFileSelect"
    />
    <UIcon name="i-heroicons-cloud-arrow-up" class="upload-icon" />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  files: [files: File[]]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    emit('files', Array.from(target.files))
  }
  target.value = ''
}

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files) {
    emit('files', Array.from(event.dataTransfer.files))
  }
}
</script>

<style scoped>
.upload-zone {
  border: 2px dashed #d1d5db;
  background: transparent;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px !important;
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.02);
}

.hidden-input {
  display: none;
}

.upload-icon {
  width: 80px;
  height: 80px;
  color: #9ca3af;
}
</style>
