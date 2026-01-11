<template>
  <div class="page-container">
    <div class="config-wrapper">
      <!-- S3 配置卡片 -->
      <div class="form-card">
        <h2 class="card-title">S3 配置</h2>
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
              Endpoint
            </label>
            <UInput v-model="config.s3.endpoint" placeholder="https://your-r2-endpoint.r2.cloudflarestorage.com" size="lg" class="styled-input"/>
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clip-rule="evenodd"/></svg>
              Access Key ID
            </label>
            <UInput v-model="config.s3.accessKeyId" placeholder="your-access-key-id" size="lg" class="styled-input"/>
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clip-rule="evenodd"/></svg>
              Secret Access Key
            </label>
            <UInput v-model="config.s3.secretAccessKey" type="password" placeholder="your-secret-access-key" size="lg" class="styled-input"/>
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/></svg>
              Bucket 名称
            </label>
            <UInput v-model="config.s3.bucket" placeholder="your-bucket-name" size="lg" class="styled-input"/>
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
              Region
            </label>
            <UInput v-model="config.s3.region" placeholder="auto" size="lg" class="styled-input"/>
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/></svg>
              公共访问域名（可选）
            </label>
            <UInput v-model="config.s3.publicUrl" placeholder="https://your-bucket.your-domain.com" size="lg" class="styled-input"/>
          </div>
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>
              上传文件目录
            </label>
            <UInput v-model="config.s3.uploadDir" placeholder="picture" size="lg" class="styled-input"/>
          </div>
        </div>
      </div>

      <!-- 图片压缩配置卡片 -->
      <div class="form-card">
        <h2 class="card-title">图片压缩</h2>
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg>
              上传时压缩图片
            </label>
            <label class="toggle-switch">
              <input type="checkbox" v-model="config.compress.enabled" class="toggle-input"/>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div v-if="config.compress.enabled" class="fade-in">
            <div class="form-group">
              <label class="form-label">
                <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>
                压缩质量 (1-100)
              </label>
              <div class="quality-input-group">
                <UInput v-model.number="config.compress.quality" type="number" min="1" max="100" size="lg" class="styled-input"/>
                <span class="quality-unit">%</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">
                <svg class="label-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5z" clip-rule="evenodd"/></svg>
                输出格式
              </label>
              <div class="format-options">
                <label
                  v-for="format in ['jpg', 'png', 'webp', 'avif']"
                  :key="format"
                  class="format-option"
                  :class="{ active: config.compress.format === format }"
                >
                  <input type="radio" v-model="config.compress.format" :value="format" class="format-radio"/>
                  <span class="format-name">{{ format.toUpperCase() }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 重命名配置卡片 -->
      <div class="form-card">
        <h2 class="card-title">重命名配置</h2>
        <div class="form-section">
          <div class="form-group">
            <label class="form-label">重命名策略</label>
            <div class="strategy-options">
              <label
                class="strategy-option"
                :class="{ active: config.rename.strategy === 'timestamp' }"
              >
                <input type="radio" v-model="config.rename.strategy" value="timestamp" class="strategy-radio"/>
                <div class="strategy-content">
                  <svg class="strategy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  <span class="strategy-name">时间戳</span>
                </div>
              </label>
              <label
                class="strategy-option"
                :class="{ active: config.rename.strategy === 'random' }"
              >
                <input type="radio" v-model="config.rename.strategy" value="random" class="strategy-radio"/>
                <div class="strategy-content">
                  <svg class="strategy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                  </svg>
                  <span class="strategy-name">随机字符</span>
                </div>
              </label>
              <label
                class="strategy-option"
                :class="{ active: config.rename.strategy === 'custom' }"
              >
                <input type="radio" v-model="config.rename.strategy" value="custom" class="strategy-radio"/>
                <div class="strategy-content">
                  <svg class="strategy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  <span class="strategy-name">自定义</span>
                </div>
              </label>
            </div>
          </div>

          <div v-if="config.rename.strategy === 'custom'" class="form-group fade-in">
            <label class="form-label">自定义命名格式</label>
            <UInput v-model="config.rename.customFormat" placeholder="{Y}{m}{d}-{filename}" size="lg" class="styled-input"/>
          </div>

          <div class="form-group">
            <label class="form-label">占位符说明</label>
            <table class="placeholder-table">
              <thead>
                <tr>
                  <th>占位符</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>{Y}</td><td>年份 (2022)</td></tr>
                <tr><td>{y}</td><td>两位数年份 (22)</td></tr>
                <tr><td>{m}</td><td>月份 (01-12)</td></tr>
                <tr><td>{d}</td><td>日期 (01-31)</td></tr>
                <tr><td>{h}</td><td>小时 (00-23)</td></tr>
                <tr><td>{i}</td><td>分钟 (00-59)</td></tr>
                <tr><td>{s}</td><td>秒 (00-59)</td></tr>
                <tr><td>{ms}</td><td>毫秒 (000-999)</td></tr>
                <tr><td>{timestamp}</td><td>时间戳 (毫秒)</td></tr>
                <tr><td>{uuid}</td><td>唯一字符串</td></tr>
                <tr><td>{md5}</td><td>随机 md5</td></tr>
                <tr><td>{md5-16}</td><td>随机 md5 前 16 位</td></tr>
                <tr><td>{str-number}</td><td>随机 number 位字符串</td></tr>
                <tr><td>{filename}</td><td>原始文件名</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <button class="save-btn" :disabled="isSaving" @click="saveConfig">
          <svg v-if="!isSaving" class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17,21 17,13 7,13 7,21"/>
            <polyline points="7,3 7,8 15,8"/>
          </svg>
          <svg v-else class="btn-icon loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
            <path d="M12 2a10 10 0 0110 10"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Toast 提示 -->
    <Toast v-model="showToast" :message="toastMessage" />
  </div>
</template>

<script setup lang="ts">
interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  publicUrl: string;
  uploadDir: string;
}

interface RenameConfig {
  strategy: 'timestamp' | 'random' | 'custom';
  customFormat: string;
}

interface CompressConfig {
  enabled: boolean;
  quality: number;
  format: 'jpg' | 'png' | 'webp' | 'avif';
}

interface AppConfig {
  s3: S3Config;
  rename: RenameConfig;
  compress: CompressConfig;
}

const STORAGE_KEY = 'pic-app-config';

const config = ref<AppConfig>({
  s3: {
    endpoint: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucket: '',
    region: 'auto',
    publicUrl: '',
    uploadDir: 'picture',
  },
  rename: {
    strategy: 'timestamp',
    customFormat: '{filename}',
  },
  compress: {
    enabled: false,
    quality: 85,
    format: 'jpg',
  },
});

const isSaving = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

// 显示提示
const showToastMessage = (message: string) => {
  toastMessage.value = message;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 2000);
};

// 保存配置
const saveConfig = async () => {
  isSaving.value = true;
  try {
    await $fetch('/api/config', {
      method: 'POST',
      body: config.value,
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value));
    showToastMessage('配置已保存');
  } catch (error) {
    console.error('保存配置失败:', error);
    showToastMessage('保存失败');
  } finally {
    isSaving.value = false;
  }
};

// 加载配置
const loadConfig = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      config.value.s3 = { ...config.value.s3, ...parsed.s3 };
      config.value.rename = { ...config.value.rename, ...parsed.rename };
      config.value.compress = { ...config.value.compress, ...parsed.compress };
    }
  } catch (error) {
    console.error('加载配置失败:', error);
  }
};

// 页面加载时获取配置
onMounted(() => {
  loadConfig();
})
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

.config-wrapper {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 表单卡片 */
.form-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

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

/* 重命名策略选择样式 */
.strategy-options {
  display: flex;
  gap: 12px;
}

.strategy-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  flex: 1;
  justify-content: center;
}

.strategy-option:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.strategy-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.strategy-radio {
  display: none;
}

.strategy-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.strategy-icon {
  width: 18px;
  height: 18px;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.strategy-option.active .strategy-icon {
  color: #3b82f6;
}

.strategy-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.strategy-option.active .strategy-name {
  color: #3b82f6;
}

/* 淡入动画 */
.fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.placeholder-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.placeholder-table th,
.placeholder-table td {
  border: 1px solid #e5e7eb;
  padding: 8px;
  text-align: left;
}

.placeholder-table th {
  background-color: #f9fafb;
  font-weight: 500;
}

.action-section {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

.save-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1f2937;
  border: none;
}

.save-btn:hover {
  background: #374151;
}

.btn-icon {
  width: 20px;
  height: 20px;
  color: white;
}

/* 开关样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  cursor: pointer;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-slider {
  background-color: #3b82f6;
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

/* 质量输入框组 */
.quality-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quality-unit {
  font-size: 14px;
  color: #6b7280;
}

/* 格式选项 */
.format-options {
  display: flex;
  gap: 12px;
}

.format-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.format-option:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.format-option.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.format-radio {
  display: none;
}

.format-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.format-option.active .format-name {
  color: #3b82f6;
}
</style>
