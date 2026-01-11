<template>
  <div class="page-container">
    <div class="file-manager">
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        <div class="breadcrumb-item" @click="navigateTo('')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <span>根目录</span>
        </div>
        <template v-for="(part, index) in pathParts" :key="index">
          <svg class="breadcrumb-separator" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
          <div
            class="breadcrumb-item"
            @click="navigateTo(pathParts.slice(0, index + 1).join('/'))"
          >
            <span>{{ part }}</span>
          </div>
        </template>
      </div>

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
        <p>此文件夹为空</p>
      </div>

      <!-- 文件列表 -->
      <div v-else class="file-list">
        <!-- 文件夹 -->
        <div 
          v-for="folder in folders" 
          :key="folder.path"
          class="file-item folder"
          @click="navigateTo(folder.path)"
        >
          <div class="file-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
          </div>
          <div class="file-info">
            <span class="file-name">{{ folder.name }}</span>
          </div>
          <div class="file-actions">
            <button class="icon-btn" @click.stop="deleteItem(folder, 'folder')" title="删除">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 文件 -->
        <div 
          v-for="file in files" 
          :key="file.path"
          class="file-item"
          :class="{ selected: selectedFile === file.path }"
          @click="selectFile(file.path)"
        >
          <div class="file-icon" :class="getFileClass(file.name)">
            <svg v-if="isImage(file.name)" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
            <svg v-else-if="isText(file.name)" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
            </svg>
          </div>
          <div class="file-info">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatSize(file.size) }}</span>
          </div>
          <div class="file-actions">
            <button class="icon-btn" @click.stop="handlePreview(file)" title="预览">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="icon-btn" @click.stop="downloadFile(file)" title="下载">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </button>
            <button v-if="isEditable(file.name)" class="icon-btn" @click.stop="handleEdit(file)" title="编辑">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="icon-btn" @click.stop="renameItem(file)" title="重命名">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
            <button class="icon-btn delete" @click.stop="deleteItem(file, 'file')" title="删除">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <div v-if="showPreview" class="modal-overlay" @click="closePreview">
      <div class="modal-content preview-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ previewData?.name }}</h3>
          <button class="close-btn" @click="closePreview">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <img v-if="isImage(previewData?.name)" :src="previewUrl" :alt="previewData?.name" class="preview-image" />
          <pre v-else class="preview-text">{{ previewContent }}</pre>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <div v-if="showEdit" class="modal-overlay" @click="closeEdit">
      <div class="modal-content edit-modal" @click.stop>
        <div class="modal-header">
          <h3>编辑 {{ editFileName }}</h3>
          <button class="close-btn" @click="closeEdit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <textarea 
            v-model="editContent" 
            class="edit-textarea"
            spellcheck="false"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEdit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <button class="btn btn-primary" @click="saveEdit" :disabled="saving">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
              <polyline points="7,3 7,8 15,8"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 重命名弹窗 -->
    <div v-if="showRename" class="modal-overlay" @click="closeRename">
      <div class="modal-content rename-modal" @click.stop>
        <div class="modal-header">
          <h3>重命名</h3>
          <button class="close-btn" @click="closeRename">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <input 
            v-model="newName" 
            class="rename-input" 
            :placeholder="renameTarget?.name"
            @keyup.enter="confirmRename"
          />
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeRename">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <button class="btn btn-primary" @click="confirmRename" :disabled="!newName.trim()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDelete" class="modal-overlay" @click="closeDelete">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="close-btn" @click="closeDelete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>确定要删除 {{ deleteType === 'folder' ? '文件夹' : '文件' }} "{{ deleteTarget?.name }}" 吗？</p>
          <p v-if="deleteType === 'folder'" class="warning">文件夹内的所有内容将被删除</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeDelete">
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

interface AppConfig {
  s3: S3Config
}

interface FileItem {
  name: string
  path: string
  type: 'file' | 'folder'
  size?: number
  lastModified?: Date
}

const currentPath = ref('')
const folders = ref<FileItem[]>([])
const files = ref<FileItem[]>([])
const loading = ref(false)
const selectedFile = ref<string | null>(null)

// 弹窗状态
const showPreview = ref(false)
const showEdit = ref(false)
const showRename = ref(false)
const showDelete = ref(false)

// 弹窗数据
const previewData = ref<FileItem | null>(null)
const previewUrl = ref('')
const previewContent = ref('')

const editFileName = ref('')
const editPath = ref('')
const editContent = ref('')
const saving = ref(false)

const renameTarget = ref<FileItem | null>(null)
const newName = ref('')

const deleteTarget = ref<FileItem | null>(null)
const deleteType = ref<'file' | 'folder'>('file')
const deleting = ref(false)

// Toast
const showToast = ref(false)
const toastMessage = ref('')

// 获取配置
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

// 显示提示
const showToastMessage = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 路径部分
const pathParts = computed(() => {
  if (!currentPath.value) return []
  return currentPath.value.split('/').filter(Boolean)
})

// 是否有内容
const hasItems = computed(() => folders.value.length > 0 || files.value.length > 0)

// 获取文件列表
const fetchFiles = async () => {
  const config = getConfig()
  if (!config) {
    showToastMessage('请先配置 S3 信息')
    return
  }

  loading.value = true
  try {
    const response = await $fetch<{
      success: boolean
      folders: FileItem[]
      files: FileItem[]
    }>('/api/s3/files', {
      method: 'GET',
      params: { path: currentPath.value },
      headers: {
        'x-s3-config': JSON.stringify(config)
      }
    })

    if (response.success) {
      folders.value = response.folders
      files.value = response.files
    }
  } catch (error) {
    console.error('获取文件列表失败:', error)
    showToastMessage('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 导航到文件夹
const navigateTo = (path: string) => {
  currentPath.value = path
  selectedFile.value = null
  fetchFiles()
}

// 选择文件
const selectFile = (path: string) => {
  selectedFile.value = selectedFile.value === path ? null : path
}

// 格式化文件大小
const formatSize = (bytes?: number) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

// 判断文件类型
const isImage = (name?: string) => {
  if (!name) return false
  const ext = name.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')
}

const isText = (name?: string) => {
  if (!name) return false
  const ext = name.split('.').pop()?.toLowerCase()
  return ['txt', 'md', 'json', 'js', 'ts', 'css', 'html', 'xml', 'yaml', 'yml', 'ini', 'conf'].includes(ext || '')
}

const isEditable = (name?: string) => {
  return isText(name)
}

const getFileClass = (name: string) => {
  if (isImage(name)) return 'image'
  if (isText(name)) return 'text'
  return 'default'
}

// 预览文件
const handlePreview = async (file: FileItem) => {
  const config = getConfig()
  if (!config) {
    showToastMessage('请先配置 S3 信息')
    return
  }

  previewData.value = file
  showPreview.value = true

  try {
    if (isImage(file.name)) {
      const response = await $fetch<{ success: boolean; url: string }>('/api/s3/download', {
        method: 'GET',
        params: { path: getFullPath(file.path) },
        headers: { 'x-s3-config': JSON.stringify(config) }
      })
      if (response.success) {
        previewUrl.value = response.url
      }
    } else {
      const response = await $fetch<{ success: boolean; content: string }>('/api/s3/content', {
        method: 'GET',
        params: { path: getFullPath(file.path) },
        headers: { 'x-s3-config': JSON.stringify(config) }
      })
      if (response.success) {
        previewContent.value = response.content
      }
    }
  } catch (error) {
    console.error('预览失败:', error)
    showToastMessage('预览失败')
  }
}

const closePreview = () => {
  showPreview.value = false
  previewData.value = null
  previewUrl.value = ''
  previewContent.value = ''
}

// 下载文件
const downloadFile = async (file: FileItem) => {
  const config = getConfig()
  if (!config) {
    showToastMessage('请先配置 S3 信息')
    return
  }

  try {
    const response = await $fetch<{ success: boolean; url: string }>('/api/s3/download', {
      method: 'GET',
      params: { path: getFullPath(file.path) },
      headers: { 'x-s3-config': JSON.stringify(config) }
    })

    if (response.success) {
      window.open(response.url, '_blank')
    }
  } catch (error) {
    console.error('下载失败:', error)
    showToastMessage('下载失败')
  }
}

// 编辑文件
const handleEdit = async (file: FileItem) => {
  const config = getConfig()
  if (!config) {
    showToastMessage('请先配置 S3 信息')
    return
  }

  editFileName.value = file.name
  editPath.value = getFullPath(file.path)
  showEdit.value = true

  try {
    const response = await $fetch<{ success: boolean; content: string }>('/api/s3/content', {
      method: 'GET',
      params: { path: editPath.value },
      headers: { 'x-s3-config': JSON.stringify(config) }
    })

    if (response.success) {
      editContent.value = response.content
    }
  } catch (error) {
    console.error('获取文件内容失败:', error)
    showToastMessage('获取文件内容失败')
  }
}

const closeEdit = () => {
  showEdit.value = false
  editFileName.value = ''
  editPath.value = ''
  editContent.value = ''
}

const saveEdit = async () => {
  const config = getConfig()
  if (!config) return

  saving.value = true
  try {
    await $fetch('/api/s3/save', {
      method: 'POST',
      body: { path: editPath.value, content: editContent.value },
      headers: { 'x-s3-config': JSON.stringify(config) }
    })
    showToastMessage('保存成功')
    closeEdit()
  } catch (error) {
    console.error('保存失败:', error)
    showToastMessage('保存失败')
  } finally {
    saving.value = false
  }
}

// 重命名
const renameItem = (item: FileItem) => {
  renameTarget.value = item
  newName.value = ''
  showRename.value = true
}

const closeRename = () => {
  showRename.value = false
  renameTarget.value = null
  newName.value = ''
}

const confirmRename = async () => {
  if (!renameTarget.value || !newName.value.trim()) return

  const config = getConfig()
  if (!config) return

  const oldPath = getFullPath(renameTarget.value.path)
  const newPathName = newName.value.trim()
  const oldItem = renameTarget.value

  try {
    await $fetch('/api/s3/rename', {
      method: 'POST',
      body: { path: oldPath, newName: newPathName },
      headers: { 'x-s3-config': JSON.stringify(config) }
    })
    showToastMessage('重命名成功')
    closeRename()
    // 从列表中移除旧文件
    if (oldItem.type === 'folder') {
      folders.value = folders.value.filter(f => f.path !== oldItem.path)
    } else {
      files.value = files.value.filter(f => f.path !== oldItem.path)
    }
  } catch (error) {
    console.error('重命名失败:', error)
    showToastMessage('重命名失败')
  }
}

// 删除
const deleteItem = (item: FileItem, type: 'file' | 'folder') => {
  deleteTarget.value = item
  deleteType.value = type
  showDelete.value = true
}

const closeDelete = () => {
  showDelete.value = false
  deleteTarget.value = null
  deleteType.value = 'file'
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return

  const config = getConfig()
  if (!config) return

  deleting.value = true
  try {
    await $fetch('/api/s3/delete', {
      method: 'DELETE',
      body: { path: getFullPath(deleteTarget.value.path) },
      headers: { 'x-s3-config': JSON.stringify(config) }
    })
    showToastMessage('删除成功')
    closeDelete()
    fetchFiles()
  } catch (error) {
    console.error('删除失败:', error)
    showToastMessage('删除失败')
  } finally {
    deleting.value = false
  }
}

// 获取完整路径（包含 uploadDir）
const getFullPath = (path: string) => {
  const config = getConfig()
  const uploadDir = config?.s3?.uploadDir || ''
  if (!currentPath.value) {
    return uploadDir ? `${uploadDir}/${path}` : path
  }
  return uploadDir ? `${uploadDir}/${currentPath.value}/${path}` : `${currentPath.value}/${path}`
}

// 页面加载时获取文件列表
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
  max-width: 900px;
  margin: 0 auto;
}

/* 面包屑 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #374151;
}

.breadcrumb-item:hover {
  background: #f3f4f6;
}

.breadcrumb-item svg {
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.breadcrumb-separator {
  width: 16px;
  height: 16px;
  color: #9ca3af;
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

/* 文件列表 */
.file-list {
  padding: 8px;
}

/* 文件项 */
.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: #f9fafb;
}

.file-item.folder {
  background: #fefce8;
}

.file-item.folder:hover {
  background: #fef9c3;
}

.file-item.selected {
  background: #eff6ff;
}

.file-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.file-icon svg {
  width: 24px;
  height: 24px;
}

.file-icon.image {
  background: #dcfce7;
  color: #16a34a;
}

.file-icon.text {
  background: #dbeafe;
  color: #2563eb;
}

.file-icon.default {
  background: #f3f4f6;
  color: #6b7280;
}

.folder .file-icon {
  background: #fef9c3;
  color: #ca8a04;
}

.file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #9ca3af;
}

.file-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.file-item:hover .file-actions {
  opacity: 1;
}

/* 图标按钮 */
.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.icon-btn:hover {
  background: #f3f4f6;
}

.icon-btn:hover svg {
  color: #374151;
}

.icon-btn.delete:hover {
  background: #fef2f2;
}

.icon-btn.delete:hover svg {
  color: #ef4444;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
}

.close-btn svg {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.modal-body {
  padding: 20px;
  overflow: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
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
}

.btn svg {
  width: 18px;
  height: 18px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6 !important;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb !important;
}

.btn-secondary {
  background: #f3f4f6 !important;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb !important;
}

.btn-danger {
  background: #ef4444 !important;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626 !important;
}

/* 预览弹窗 */
.preview-modal {
  max-width: 800px;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 8px;
}

.preview-text {
  margin: 0;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 60vh;
  overflow: auto;
}

/* 编辑弹窗 */
.edit-modal {
  max-width: 700px;
}

.edit-textarea {
  width: 100%;
  min-height: 300px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
}

.edit-textarea:focus {
  border-color: #3b82f6;
}

/* 重命名弹窗 */
.rename-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px !important;
  font-size: 14px;
  outline: none;
}

.rename-input:focus {
  border-color: #3b82f6;
}

/* 删除弹窗 */
.delete-modal .warning {
  color: #ef4444;
  font-size: 13px;
  margin-top: 8px;
}
</style>
