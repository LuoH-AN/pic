import type { ClientConfig, CompressConfig } from '~~/types'

const STORAGE_KEY = 'pic-app-config'

const COMPRESS_FORMATS: CompressConfig['format'][] = ['jpg', 'png', 'webp', 'avif']

const defaultConfig: ClientConfig = {
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
  const config = useState<ClientConfig>('client-config', () => structuredClone(defaultConfig))
  const loaded = useState<boolean>('client-config-loaded', () => false)

  const getStorage = () => {
    if (!import.meta.client || typeof window === 'undefined') return null

    try {
      return window.localStorage
    } catch {
      return null
    }
  }

  const normalizeQuality = (raw: unknown) => {
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return defaultConfig.compress.quality
    return Math.max(1, Math.min(100, Math.round(parsed)))
  }

  const normalizeConfig = (raw: unknown): ClientConfig => {
    const parsed = (raw && typeof raw === 'object') ? (raw as Partial<ClientConfig>) : {}
    const nextFormat = parsed.compress?.format
    const safeFormat = COMPRESS_FORMATS.includes(nextFormat as CompressConfig['format'])
      ? (nextFormat as CompressConfig['format'])
      : defaultConfig.compress.format

    return {
      rename: {
        strategy: parsed.rename?.strategy || defaultConfig.rename.strategy,
        customFormat: parsed.rename?.customFormat?.trim() || defaultConfig.rename.customFormat,
      },
      compress: {
        enabled: Boolean(parsed.compress?.enabled),
        quality: normalizeQuality(parsed.compress?.quality),
        format: safeFormat,
      },
    }
  }

  const readStoredConfig = (): ClientConfig | null => {
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
    if (loaded.value) return
    const stored = readStoredConfig()
    if (stored) {
      config.value = stored
    }
    loaded.value = true
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

  const getConfig = (): ClientConfig => {
    loadConfig()
    return config.value
  }

  return { config, loadConfig, saveConfigToStorage, getConfig }
}
