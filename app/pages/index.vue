<template>
  <div class="page-container">
    <div class="upload-wrapper">
      <!-- 上传区域 -->
      <div
        class="upload-zone"
        :class="{ 'drag-over': isDragOver }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden-input"
          @change="handleFileSelect"
        />
        
        <UIcon name="i-heroicons-cloud-arrow-up" class="upload-icon" />
      </div>

      <!-- 预览区域 -->
      <div v-if="previewFiles.length > 0" class="preview-section">
        <!-- 文件列表 -->
        <div class="file-list">
          <div
            v-for="(file, index) in previewFiles"
            :key="index"
            class="file-item"
          >
            <!-- 图片预览 -->
            <div class="file-preview">
              <img :src="file.preview" :alt="file.name" class="preview-image" />
            </div>
            
            <!-- URL 显示 -->
            <div v-if="file.uploaded" class="file-url" @click="copyUrl(file.url)">
              {{ file.url }}
            </div>
            
            <!-- 操作按钮 -->
            <div class="file-actions">
              <button 
                v-if="!file.uploaded" 
                class="icon-btn upload" 
                @click="uploadSingle(file)"
                :disabled="file.uploading"
                title="上传"
              >
                <svg v-if="!file.uploading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <svg v-else class="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                  <path d="M12 2a10 10 0 0110 10"/>
                </svg>
              </button>
              
              <button 
                v-if="file.uploaded" 
                class="icon-btn copy" 
                @click="copyUrl(file.url)"
                title="复制链接"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
              
              <button 
                class="icon-btn delete" 
                @click="removeFile(index)"
                title="删除"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="bottom-actions">
          <div class="left-spacer"></div>
          <div class="right-actions">
            <button 
              class="icon-btn" 
              @click="uploadAll" 
              :loading="isUploading"
              title="全部上传"
            >
              <svg v-if="!isUploading" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <svg v-else class="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                <path d="M12 2a10 10 0 0110 10"/>
              </svg>
            </button>
            <button class="icon-btn delete" @click="removeAll" title="全部删除">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <Toast v-model="showToast" :message="toastMessage" />
  </div>
</template>

<script setup lang="ts">
interface S3Config {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  region: string
  publicUrl: string
  uploadDir: string
}

interface RenameConfig {
  strategy: 'timestamp' | 'random' | 'custom'
  customFormat: string
}

interface AppConfig {
  s3: S3Config
  rename: RenameConfig
}

interface PreviewFile {
  file: File
  preview: string
  name: string
  uploaded?: boolean
  url?: string
  uploading?: boolean
}

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const previewFiles = ref<PreviewFile[]>([])
const isUploading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

// 显示提示
const showToastMessage = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 复制 URL
const copyUrl = async (url?: string) => {
  if (!url) return
  try {
    await navigator.clipboard.writeText(url)
    showToastMessage('已复制到剪贴板')
  } catch (e) {
    showToastMessage('复制失败')
  }
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
  target.value = ''
}

// 处理拖拽
const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

// 添加文件到预览
const addFiles = (files: File[]) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  imageFiles.forEach(file => {
    const preview = URL.createObjectURL(file)
    previewFiles.value.push({
      file,
      preview,
      name: file.name
    })
  })
}

// 移除单个文件
const removeFile = (index: number) => {
  const file = previewFiles.value[index]
  if (file) {
    URL.revokeObjectURL(file.preview)
  }
  previewFiles.value.splice(index, 1)
}

// 移除全部文件
const removeAll = () => {
  previewFiles.value.forEach(f => URL.revokeObjectURL(f.preview))
  previewFiles.value = []
}

// 获取本地存储的配置
const getConfig = (): AppConfig | null => {
  try {
    const stored = localStorage.getItem('pic-app-config')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('获取配置失败:', e)
  }
  return null
}

// 上传单个文件
const uploadSingle = async (previewFile: PreviewFile) => {
  const config = getConfig()
  if (!config) {
    showToastMessage('请先配置 S3 信息')
    return
  }

  previewFile.uploading = true

  try {
    const formData = new FormData()
    formData.append('file', previewFile.file)
    
    const response = await $fetch<{ success: boolean; url: string }>('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'x-s3-config': JSON.stringify(config)
      }
    })
    
    if (response.success) {
      previewFile.uploaded = true
      previewFile.url = response.url
      showToastMessage('上传成功')
    }
  } catch (error) {
    console.error('上传失败:', error)
    showToastMessage('上传失败')
  } finally {
    previewFile.uploading = false
  }
}

// 全部上传
const uploadAll = async () => {
  const config = getConfig()
  if (!config) {
    showToastMessage('请先配置 S3 信息')
    return
  }

  const filesToUpload = previewFiles.value.filter(f => !f.uploaded && !f.uploading)
  if (filesToUpload.length === 0) {
    showToastMessage('没有需要上传的文件')
    return
  }

  isUploading.value = true

  try {
    for (const previewFile of filesToUpload) {
      await uploadSingle(previewFile)
    }
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #faf8f5;
  padding: 40px 24px;
}

.upload-wrapper {
  width: 100%;
  max-width: 720px;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  background: transparent;
  padding: 60px 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px !important;
}

.upload-zone:hover,
.upload-zone.drag-over {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.02);
}

.hidden-input {
  display: none;
}

.upload-icon {
  width: 80px;
  height: 80px;
  color: #9ca3af;
}

.preview-section {
  margin-top: 24px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: white;
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
}

/* 图标按钮样式 */
.icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #faf8f5 !important;
  border: none !important;
  border-radius: 8px !important;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}

.icon-btn:hover {
  background: #f3f4f6 !important;
}

.icon-btn.upload svg {
  color: #3b82f6;
}

.icon-btn.upload:hover:not(:disabled) {
  background: #eff6ff !important;
}

.icon-btn.upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon-btn.copy svg {
  color: #10b981;
}

.icon-btn.copy:hover {
  background: #ecfdf5 !important;
}

.icon-btn.delete svg {
  color: #ef4444;
}

.icon-btn.delete:hover {
  background: #fef2f2 !important;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 底部操作栏 */
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
  display: flex;
  gap: 8px;
}
</style>
