<template>
  <div v-if="files.length > 0" class="preview-section">
    <div class="file-list">
      <UploadFilePreviewItem
        v-for="(file, index) in files"
        :key="file.preview"
        :file="file"
        @upload="$emit('upload', file)"
        @copy="(url, targetFile) => $emit('copy', url, targetFile)"
        @remove="$emit('remove', index)"
      />
    </div>

    <div class="bottom-actions">
      <div class="left-spacer"></div>
      <div class="right-actions">
        <UiIconButton
          variant="upload"
          :loading="isUploading"
          :disabled="!hasPendingUpload"
          title="全部上传"
          @click="$emit('uploadAll')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
        </UiIconButton>
        <UiIconButton variant="delete" title="全部删除" @click="$emit('removeAll')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </UiIconButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PreviewFile } from '~~/types'

interface Props {
  files: PreviewFile[]
  isUploading?: boolean
}

const props = defineProps<Props>()
defineEmits<{
  upload: [file: PreviewFile]
  copy: [url?: string, file?: PreviewFile]
  remove: [index: number]
  uploadAll: []
  removeAll: []
}>()

const hasPendingUpload = computed(() => props.files.some(file => !file.uploaded && !file.uploading))
</script>

<style scoped>
.preview-section {
  margin-top: 24px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.left-spacer {
  flex: 1;
}

.right-actions {
  --card-bg: var(--color-surface-alt);
  display: flex;
  gap: 8px;
}
</style>
