<template>
  <UiFormCard title="S3 配置">
    <div class="form-group">
      <label class="form-label">
        <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
        Endpoint
      </label>
      <UInput v-model="model.endpoint" placeholder="https://your-r2-endpoint.r2.cloudflarestorage.com" size="lg" class="styled-input"/>
    </div>
    <div class="form-group">
      <label class="form-label">
        <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clip-rule="evenodd"/></svg>
        Access Key ID
      </label>
      <UInput v-model="model.accessKeyId" placeholder="your-access-key-id" size="lg" class="styled-input"/>
    </div>
    <div class="form-group">
      <label class="form-label">
        <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clip-rule="evenodd"/></svg>
        Secret Access Key
      </label>
      <UInput v-model="model.secretAccessKey" type="password" placeholder="your-secret-access-key" size="lg" class="styled-input"/>
    </div>
    <div class="form-group">
      <label class="form-label">
        <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/></svg>
        Bucket 名称
      </label>
      <UInput v-model="model.bucket" placeholder="your-bucket-name" size="lg" class="styled-input"/>
    </div>
    <div class="form-group">
      <label class="form-label">
        <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
        Region
      </label>
      <UInput v-model="model.region" placeholder="auto" size="lg" class="styled-input"/>
    </div>
    <div class="form-group">
      <label class="form-label">
        <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/></svg>
        公共访问域名（可选）
      </label>
      <UInput v-model="model.publicUrl" placeholder="https://your-bucket.your-domain.com" size="lg" class="styled-input"/>
    </div>
    <div class="form-group">
      <label class="form-label">
        <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>
        上传文件目录
      </label>
      <UInput v-model="model.uploadDir" placeholder="picture" size="lg" class="styled-input"/>
    </div>
  </UiFormCard>
</template>

<script setup lang="ts">
import type { S3Config } from '~~/types'

const model = defineModel<S3Config>({ required: true })
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 6px;
}

.label-icon {
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.styled-input :deep(input) {
  border-radius: 16px !important;
  border: 2px solid #e5e7eb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.styled-input :deep(input:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}
</style>
