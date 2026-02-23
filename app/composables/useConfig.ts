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

  const getStorage = () => {
    if (!process.client || typeof window === 'undefined') return null

    try {
      return window.localStorage
    } catch {
      return null
    }
  }

  const normalizeConfig = (raw: unknown): AppConfig => {
    const parsed = (raw && typeof raw === 'object') ? (raw as Partial<AppConfig>) : {}
    return {
      s3: { ...defaultConfig.s3, ...(parsed.s3 || {}) },
      rename: { ...defaultConfig.rename, ...(parsed.rename || {}) },
      compress: { ...defaultConfig.compress, ...(parsed.compress || {}) },
    }
  }

  const readStoredConfig = (): AppConfig | null => {
    const storage = getStorage()
    if (!storage) return null

    try {
      const stored = storage.getItem(STORAGE_KEY)
      if (!stored) return null
      return normalizeConfig(JSON.parse(stored))
    } catch (error) {
      console.error('获取配置失败:', error)
      return null
    }
  }

  const loadConfig = () => {
    const stored = readStoredConfig()
    if (stored) {
      config.value = stored
    }
  }

  const saveConfigToStorage = () => {
    const storage = getStorage()
    if (!storage) return

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(config.value))
    } catch (error) {
      console.error('保存配置失败:', error)
    }
  }

  const getConfig = (): AppConfig | null => {
    return readStoredConfig()
  }

  return { config, loadConfig, saveConfigToStorage, getConfig }
}
