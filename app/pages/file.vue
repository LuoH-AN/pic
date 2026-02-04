<template>
  <div class="page-container">
    <div class="file-manager">
      <FileBreadcrumb :path="currentPath" @navigate="navigateTo" />

      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!hasItems" class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>
        <p>此文件夹为空或没有图片</p>
      </div>

      <!-- 图片网格 -->
      <div v-else class="image-grid">
        <FileFolderCard
          v-for="folder in folders"
          :key="folder.path"
          :name="folder.name"
          @click="navigateTo(folder.path)"
        />

        <FileImageCard
          v-for="file in imageFiles"
          :key="file.path"
          :src="getImageUrl(file)"
          :name="file.name"
          @click="openPreview(file)"
        />
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <FileImagePreview
      v-model="showPreview"
      :url="previewUrl"
      :name="previewFile?.name || ''"
      :show-nav="imageFiles.length > 1"
      @prev="prevImage"
      @next="nextImage"
      @delete="handleDelete"
    />

    <!-- 删除确认弹窗 -->
    <UiModal v-model="showDeleteConfirm" title="确认删除">
      <p>确定要删除图片 "{{ previewFile?.name }}" 吗？</p>
      <template #footer>
        <button class="btn btn-secondary" @click="showDeleteConfirm = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <button class="btn btn-danger" @click="confirmDelete" :disabled="deleting">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </button>
      </template>
    </UiModal>

    <Toast v-model="show" :message="message" />
  </div>
</template>

<script setup lang="ts">
import type { FileItem } from '~~/types'

const {
  currentPath,
  folders,
  loading,
  imageFiles,
  hasItems,
  fetchFiles,
  navigateTo,
  getImageUrl,
  deleteFile,
} = useS3Files()

const { show, message, showToast } = useAppToast()

// Preview state
const showPreview = ref(false)
const previewFile = ref<FileItem | null>(null)
const previewUrl = ref('')
const currentImageIndex = ref(0)

// Delete state
const showDeleteConfirm = ref(false)
const deleting = ref(false)

const openPreview = (file: FileItem) => {
  previewFile.value = file
  previewUrl.value = getImageUrl(file)
  currentImageIndex.value = imageFiles.value.findIndex(f => f.path === file.path)
  showPreview.value = true
}

const prevImage = () => {
  if (imageFiles.value.length <= 1) return
  currentImageIndex.value = (currentImageIndex.value - 1 + imageFiles.value.length) % imageFiles.value.length
  const file = imageFiles.value[currentImageIndex.value]
  if (file) {
    previewFile.value = file
    previewUrl.value = getImageUrl(file)
  }
}

const nextImage = () => {
  if (imageFiles.value.length <= 1) return
  currentImageIndex.value = (currentImageIndex.value + 1) % imageFiles.value.length
  const file = imageFiles.value[currentImageIndex.value]
  if (file) {
    previewFile.value = file
    previewUrl.value = getImageUrl(file)
  }
}

const handleDelete = () => {
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!previewFile.value) return

  deleting.value = true
  try {
    await deleteFile(previewFile.value.path)
    showDeleteConfirm.value = false
    showPreview.value = false
    previewFile.value = null
  } catch (error) {
    showToast('删除失败')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchFiles()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #faf8f5;
  padding: 20px;
}

.file-manager {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* 加载状态 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  gap: 12px;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  gap: 12px;
  color: #9ca3af;
}

.empty svg {
  width: 48px;
  height: 48px;
}

.empty p {
  margin: 0;
  font-size: 14px;
}

/* 图片网格 */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 180px);
  gap: 20px;
  padding: 8px;
  justify-content: center;
}

/* 按钮 */
.btn {
  padding: 10px !important;
  border-radius: 8px !important;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent !important;
}

.btn svg {
  width: 18px;
  height: 18px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary svg {
  color: #6b7280;
}

.btn-secondary:hover:not(:disabled) svg {
  color: #374151;
}

.btn-danger svg {
  color: #ef4444;
}

.btn-danger:hover:not(:disabled) svg {
  color: #dc2626;
}
</style>
