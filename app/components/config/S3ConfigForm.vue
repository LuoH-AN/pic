<template>
  <UiFormCard title="S3 配置">
    <div class="form-group">
      <label class="form-label">Endpoint</label>
      <UInput v-model="model.endpoint" placeholder="https://your-r2-endpoint.r2.cloudflarestorage.com" size="lg" class="styled-input"/>
    </div>
    <div class="form-group">
      <label class="form-label">Access Key ID</label>
      <UInput v-model="model.accessKeyId" placeholder="your-access-key-id" size="lg" class="styled-input"/>
    </div>
    <div class="form-group">
      <label class="form-label">Secret Access Key</label>
      <UInput v-model="model.secretAccessKey" type="password" placeholder="your-secret-access-key" size="lg" class="styled-input"/>
    </div>
    <div class="form-group">
      <label class="form-label">Bucket 名称</label>
      <UInput v-model="model.bucket" placeholder="your-bucket-name" size="lg" class="styled-input"/>
    </div>
    <div class="form-group">
      <label class="form-label">Region</label>
      <UInput v-model="model.region" placeholder="auto" size="lg" class="styled-input"/>
    </div>
    <div class="form-group">
      <label class="form-label">公共访问域名（可选）</label>
      <UInput v-model="model.publicUrl" placeholder="https://your-bucket.your-domain.com" size="lg" class="styled-input"/>
    </div>
    <div class="form-group">
      <label class="form-label">上传文件目录（可选）</label>
      <UInput v-model="model.uploadDir" placeholder="不填则上传到桶根目录" size="lg" class="styled-input"/>
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
}

.styled-input :deep(input) {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 12px !important;
  border: 1px solid #e5e7eb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.styled-input :deep(input:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
  outline: none;
}

.styled-input {
  width: 100%;
}
</style>
