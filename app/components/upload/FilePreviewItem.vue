<script setup lang="ts">
import type { PreviewFile } from '~~/types'
import { Check, Copy, Trash2, Upload } from 'lucide-vue-next'

defineProps<{ file: PreviewFile }>()
defineEmits<{
  upload: []
  copy: [url?: string, file?: PreviewFile]
  remove: []
}>()
</script>

<template>
  <div class="preview-item">
    <div
      class="preview-item__thumb"
      :class="{ 'preview-item__thumb--placeholder': !file.preview }"
    >
      <img
        v-if="file.preview"
        :src="file.preview"
        :alt="file.name"
        class="preview-item__img"
        loading="lazy"
        decoding="async"
      >
      <span v-else class="preview-item__thumb-label">IMG</span>
    </div>

    <div
      v-if="file.uploaded"
      class="preview-item__url"
      @click="$emit('copy', file.url, file)"
    >
      {{ file.url }}
    </div>

    <div class="preview-item__actions">
      <UiIconButton
        v-if="!file.uploaded"
        variant="upload"
        :loading="file.uploading"
        title="上传"
        @click="$emit('upload')"
      >
        <Upload />
      </UiIconButton>

      <UiIconButton
        v-if="file.uploaded"
        variant="copy"
        :title="file.copied ? '已复制' : '复制链接'"
        @click="$emit('copy', file.url, file)"
      >
        <Check v-if="file.copied" />
        <Copy v-else />
      </UiIconButton>

      <UiIconButton variant="delete" title="删除" @click="$emit('remove')">
        <Trash2 />
      </UiIconButton>
    </div>
  </div>
</template>

<style scoped>
.preview-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition:
    border-color var(--duration-base) ease,
    background-color var(--duration-base) ease;
}
.preview-item:hover {
  border-color: var(--input);
  background: color-mix(in oklab, var(--accent) 40%, transparent);
}

.preview-item__thumb {
  width: 4rem;
  height: 4rem;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.preview-item__thumb--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-item__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preview-item__thumb-label {
  font-size: 11px;
  font-weight: var(--font-semibold);
  color: var(--muted-foreground);
}

.preview-item__url {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0.5rem 0.75rem;
  background: var(--secondary);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--muted-foreground);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) ease,
    color var(--duration-fast) ease;
}
.preview-item__url:hover {
  background: var(--accent);
  color: var(--foreground);
}

.preview-item__actions {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}
</style>
