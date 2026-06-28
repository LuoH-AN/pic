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
  <div v-if="files.length > 0" class="mt-6">
    <div class="mb-4 flex flex-col gap-3">
      <UploadFilePreviewItem
        v-for="(file, index) in files"
        :key="file.id"
        :file="file"
        @upload="$emit('upload', file)"
        @copy="(url, targetFile) => $emit('copy', url, targetFile)"
        @remove="$emit('remove', index)"
      />
    </div>

    <div class="flex items-center justify-between py-3">
      <div class="flex-1" />
      <div class="flex gap-2">
        <UiIconButton
          variant="upload"
          :loading="isUploading"
          :disabled="!hasPendingUpload"
          title="全部上传"
          @click="$emit('uploadAll')"
        >
          <Upload class="size-4" />
        </UiIconButton>
        <UiIconButton variant="delete" title="全部删除" @click="$emit('removeAll')">
          <Trash2 class="size-4" />
        </UiIconButton>
      </div>
    </div>
  </div>
</template>
