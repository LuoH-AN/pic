import type { AppConfig } from '~~/types'

const STORAGE_KEY = 'pic-app-config'

const defaultConfig: AppConfig = {
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
}

export function useConfig() {
  const config = ref<AppConfig>(JSON.parse(JSON.stringify(defaultConfig)))

  const loadConfig = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        config.value.s3 = { ...config.value.s3, ...parsed.s3 }
        config.value.rename = { ...config.value.rename, ...parsed.rename }
        config.value.compress = { ...config.value.compress, ...parsed.compress }
      }
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  }

  const saveConfigToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
  }

  const getConfig = (): AppConfig | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error('获取配置失败:', e)
    }
    return null
  }

  return { config, loadConfig, saveConfigToStorage, getConfig }
}
