<template>
  <div class="file-item">
    <div class="file-preview">
      <img :src="file.preview" :alt="file.name" class="preview-image" />
    </div>

    <div v-if="file.uploaded" class="file-url" @click="$emit('copy', file.url, file)">
      {{ file.url }}
    </div>

    <div class="file-actions">
      <UiIconButton
        v-if="!file.uploaded"
        variant="upload"
        :loading="file.uploading"
        title="上传"
        @click="$emit('upload')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
      </UiIconButton>

      <UiIconButton
        v-if="file.uploaded"
        variant="copy"
        :title="file.copied ? '已复制' : '复制链接'"
        @click="$emit('copy', file.url, file)"
      >
        <svg v-if="!file.copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </UiIconButton>

      <UiIconButton
        variant="delete"
        title="删除"
        @click="$emit('remove')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
        </svg>
      </UiIconButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PreviewFile } from '~~/types'

interface Props {
  file: PreviewFile
}

defineProps<Props>()
defineEmits<{
  upload: []
  copy: [url?: string, file?: PreviewFile]
  remove: []
}>()
</script>

<style scoped>
.file-item {
  --card-bg: #ffffff;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--card-bg);
  border-radius: 12px !important;
  border: 1px solid #e5e7eb;
}

.file-preview {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 8px !important;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-url {
  flex: 1;
  font-size: 12px;
  color: #6b7280;
  background: #f9fafb;
  padding: 8px 12px;
  border-radius: 8px !important;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.file-url:hover {
  background: #f3f4f6;
  color: #3b82f6;
}

.file-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}
</style>
