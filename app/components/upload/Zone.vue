<script setup lang="ts">
import { CloudUpload } from 'lucide-vue-next'

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

<template>
  <div
    class="dropzone"
    :data-drag-over="isDragOver"
    role="button"
    tabindex="0"
    aria-label="上传图片"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
    @keydown.enter.prevent="triggerFileInput"
    @keydown.space.prevent="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="dropzone__input"
      @change="handleFileSelect"
    >

    <CloudUpload class="dropzone__icon" />
  </div>
</template>

<style scoped>
.dropzone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  padding: 52px 40px;
  background: var(--card);
  border: 2px dashed var(--input);
  border-radius: var(--radius-xl);
  outline: none;
  transition:
    border-color var(--duration-base) ease,
    background-color var(--duration-base) ease;
}
.dropzone:hover,
.dropzone[data-drag-over='true'] {
  border-color: var(--foreground);
  background: color-mix(in oklab, var(--accent) 50%, transparent);
}
.dropzone:focus-visible {
  border-color: var(--foreground);
  box-shadow: 0 0 0 var(--ring-w) var(--ring-blur-color);
}
@media (max-width: 767px) {
  .dropzone {
    padding: 42px 22px;
    border-radius: var(--radius-lg);
  }
}

.dropzone__input {
  display: none;
}

.dropzone__icon {
  width: 28px;
  height: 28px;
}
@media (max-width: 767px) {
  .dropzone__icon {
    width: 24px;
    height: 24px;
  }
}
</style>
