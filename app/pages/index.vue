<template>
  <div class="flex min-h-[calc(100vh-var(--bottom-nav-offset,96px))] items-center justify-center px-6 py-10">
    <div class="w-full max-w-[720px]">
      <UploadZone @files="addFiles" />

      <UploadFileList
        :files="previewFiles"
        :is-uploading="isUploading"
        @upload="uploadSingle"
        @copy="copyUrl"
        @remove="removeFile"
        @upload-all="uploadAll"
        @remove-all="removeAll"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { previewFiles, isUploading, addFiles, removeFile, removeAll, uploadSingle, uploadAll, copyUrl } = useUpload()
</script>
