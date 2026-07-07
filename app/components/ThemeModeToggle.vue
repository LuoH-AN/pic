<script setup lang="ts">
import { Monitor, Moon, Sun } from 'lucide-vue-next'

type ThemeMode = 'system' | 'light' | 'dark'
type AppliedTheme = 'light' | 'dark'

const STORAGE_KEY = 'pic-theme-mode'
const ROOT_TRANSITION_CLASS = 'theme-transitioning'

const mode = ref<ThemeMode>('system')
let mediaQuery: MediaQueryList | null = null
let clearTransitionTimer: ReturnType<typeof setTimeout> | null = null

const iconMap = {
  system: Monitor,
  light: Sun,
  dark: Moon,
} as const

const buttonText = computed(() => {
  if (mode.value === 'system') return '主题：跟随系统'
  if (mode.value === 'light') return '主题：日间模式'
  return '主题：夜间模式'
})

const isThemeMode = (raw: string | null): raw is ThemeMode => {
  return raw === 'system' || raw === 'light' || raw === 'dark'
}

const getStoredMode = (): ThemeMode => {
  if (!import.meta.client) return 'system'
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isThemeMode(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

const saveMode = (nextMode: ThemeMode) => {
  if (!import.meta.client) return
  try {
    window.localStorage.setItem(STORAGE_KEY, nextMode)
  } catch {
    // Ignore storage failures in private mode or restricted environments.
  }
}

const getSystemTheme = (): AppliedTheme => {
  if (!import.meta.client) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const resolveTheme = (sourceMode: ThemeMode): AppliedTheme => {
  return sourceMode === 'system' ? getSystemTheme() : sourceMode
}

const applyTheme = (sourceMode: ThemeMode, animated = true) => {
  if (!import.meta.client) return
  const root = document.documentElement
  const resolved = resolveTheme(sourceMode)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (animated && !prefersReducedMotion) {
    root.classList.add(ROOT_TRANSITION_CLASS)
    if (clearTransitionTimer) {
      clearTimeout(clearTransitionTimer)
    }
    clearTransitionTimer = setTimeout(() => {
      root.classList.remove(ROOT_TRANSITION_CLASS)
      clearTransitionTimer = null
    }, 340)
  }

  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

const setMode = (nextMode: ThemeMode, options?: { persist?: boolean; animated?: boolean }) => {
  const persist = options?.persist ?? true
  const animated = options?.animated ?? true
  mode.value = nextMode
  applyTheme(nextMode, animated)
  if (persist) {
    saveMode(nextMode)
  }
}

const cycleMode = () => {
  if (mode.value === 'system') return setMode('light')
  if (mode.value === 'light') return setMode('dark')
  return setMode('system')
}

const handleSystemThemeChange = () => {
  if (mode.value !== 'system') return
  applyTheme('system')
}

onMounted(() => {
  const initialMode = getStoredMode()
  setMode(initialMode, { persist: false, animated: false })

  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  } else {
    mediaQuery.addListener(handleSystemThemeChange)
  }
})

onBeforeUnmount(() => {
  if (mediaQuery) {
    if (typeof mediaQuery.removeEventListener === 'function') {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    } else {
      mediaQuery.removeListener(handleSystemThemeChange)
    }
  }
  if (clearTransitionTimer) {
    clearTimeout(clearTransitionTimer)
    clearTransitionTimer = null
  }
})
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :title="buttonText"
    :aria-label="buttonText"
    @click="cycleMode"
  >
    <Transition name="theme-icon" mode="out-in">
      <component :is="iconMap[mode]" :key="mode" class="theme-toggle__icon" />
    </Transition>
  </button>
</template>

<style scoped>
.theme-toggle {
  position: fixed;
  right: calc(14px + env(safe-area-inset-right));
  top: calc(12px + env(safe-area-inset-top));
  z-index: var(--z-theme-toggle);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  background: transparent;
  border-radius: var(--radius-lg);
  color: var(--secondary-foreground);
  opacity: 0.95;
  cursor: pointer;
  transition:
    opacity var(--duration-base) ease,
    color var(--duration-base) ease,
    transform var(--duration-base) ease;
}
@media (max-width: 767px) {
  .theme-toggle {
    right: calc(10px + env(safe-area-inset-right));
    top: calc(10px + env(safe-area-inset-top));
  }
}

.theme-toggle__icon {
  width: 22px;
  height: 22px;
}

.theme-toggle:hover {
  opacity: 1;
  color: var(--primary);
  transform: translateY(-1px);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 3px;
}

.theme-icon-enter-active,
.theme-icon-leave-active {
  transition:
    opacity 220ms ease,
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-26deg) scale(0.72);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(20deg) scale(0.72);
}

@media (prefers-reduced-motion: reduce) {
  .theme-toggle,
  .theme-icon-enter-active,
  .theme-icon-leave-active {
    transition: none;
  }
}
</style>
