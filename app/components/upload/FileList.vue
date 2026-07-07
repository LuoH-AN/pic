<script setup lang="ts">
import type { PreviewFile } from '~~/types'
import { Trash2, Upload } from 'lucide-vue-next'

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

<template>
  <div v-if="files.length > 0" class="upload-list">
    <div class="upload-list__items">
      <UploadFilePreviewItem
        v-for="(file, index) in files"
        :key="file.id"
        :file="file"
        @upload="$emit('upload', file)"
        @copy="(url, targetFile) => $emit('copy', url, targetFile)"
        @remove="$emit('remove', index)"
      />
    </div>

    <div class="upload-list__actions">
      <div class="upload-list__spacer" />
      <div class="upload-list__btns">
        <UiIconButton
          variant="upload"
          :loading="isUploading"
          :disabled="!hasPendingUpload"
          title="全部上传"
          @click="$emit('uploadAll')"
        >
          <Upload />
        </UiIconButton>
        <UiIconButton variant="delete" title="全部删除" @click="$emit('removeAll')">
          <Trash2 />
        </UiIconButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-list {
  margin-top: 1.5rem;
}

.upload-list__items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.upload-list__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block: 0.75rem;
}

.upload-list__spacer {
  flex: 1;
}

.upload-list__btns {
  display: flex;
  gap: 0.5rem;
}
</style>
