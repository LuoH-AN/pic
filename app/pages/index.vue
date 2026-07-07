<template>
  <div class="upload-page">
    <div class="upload-page__inner">
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

<style scoped>
.upload-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--bottom-nav-offset));
  padding: var(--page-pad-y) var(--page-pad-x);
}

.upload-page__inner {
  width: 100%;
  max-width: var(--page-max-w);
}
</style>
