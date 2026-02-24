<template>
  <div class="page-container">
    <div class="upload-wrapper">
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

    <Toast v-model="show" :message="message" />
  </div>
</template>

<script setup lang="ts">
const { previewFiles, isUploading, addFiles, removeFile, removeAll, uploadSingle, uploadAll, copyUrl } = useUpload()
const { show, message } = useAppToast()
</script>

<style scoped>
.page-container {
  min-height: calc(100vh - var(--bottom-nav-offset, 96px));
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-page-bg);
  padding: var(--space-10) var(--space-6);
}

.upload-wrapper {
  width: 100%;
  max-width: 720px;
}
</style>
