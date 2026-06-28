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
  <div class="flex items-center gap-4 rounded-lg border bg-card p-3 px-4 transition-colors hover:border-input hover:bg-accent/40">
    <div
      class="size-16 shrink-0 overflow-hidden rounded-lg border bg-secondary"
      :class="{ 'flex items-center justify-center': !file.preview }"
    >
      <img
        v-if="file.preview"
        :src="file.preview"
        :alt="file.name"
        class="size-full object-cover"
        loading="lazy"
        decoding="async"
      >
      <span v-else class="text-[11px] font-semibold text-muted-foreground">IMG</span>
    </div>

    <div
      v-if="file.uploaded"
      class="flex-1 cursor-pointer truncate rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      @click="$emit('copy', file.url, file)"
    >
      {{ file.url }}
    </div>

    <div class="ml-auto flex gap-2">
      <UiIconButton
        v-if="!file.uploaded"
        variant="upload"
        :loading="file.uploading"
        title="上传"
        @click="$emit('upload')"
      >
        <Upload class="size-4" />
      </UiIconButton>

      <UiIconButton
        v-if="file.uploaded"
        variant="copy"
        :title="file.copied ? '已复制' : '复制链接'"
        @click="$emit('copy', file.url, file)"
      >
        <Check v-if="file.copied" class="size-4" />
        <Copy v-else class="size-4" />
      </UiIconButton>

      <UiIconButton variant="delete" title="删除" @click="$emit('remove')">
        <Trash2 class="size-4" />
      </UiIconButton>
    </div>
  </div>
</template>
