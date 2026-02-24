<template>
  <button
    type="button"
    class="theme-toggle"
    :title="buttonText"
    :aria-label="buttonText"
    @click="cycleMode"
  >
    <Transition name="theme-icon" mode="out-in">
      <svg
        v-if="mode === 'system'"
        key="system"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
      >
        <rect x="3" y="4" width="18" height="12" rx="2.2" />
        <path d="M8 20h8" />
        <path d="M12 16v4" />
      </svg>

      <svg
        v-else-if="mode === 'light'"
        key="light"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.4v2.3" />
        <path d="M12 19.3v2.3" />
        <path d="M4.8 4.8 6.5 6.5" />
        <path d="m17.5 17.5 1.7 1.7" />
        <path d="M2.4 12h2.3" />
        <path d="M19.3 12h2.3" />
        <path d="m4.8 19.2 1.7-1.7" />
        <path d="m17.5 6.5 1.7-1.7" />
      </svg>

      <svg
        v-else
        key="dark"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
      >
        <path d="M21 12.7A8.7 8.7 0 1 1 11.3 3a7 7 0 0 0 9.7 9.7z" />
      </svg>
    </Transition>
  </button>
</template>

<script setup lang="ts">
type ThemeMode = 'system' | 'light' | 'dark'
type AppliedTheme = 'light' | 'dark'

const STORAGE_KEY = 'pic-theme-mode'
const ROOT_TRANSITION_CLASS = 'theme-transitioning'

const mode = ref<ThemeMode>('system')
let mediaQuery: MediaQueryList | null = null
let clearTransitionTimer: ReturnType<typeof setTimeout> | null = null

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

  root.dataset.theme = resolved
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
  if (mode.value === 'system') {
    setMode('light')
    return
  }
  if (mode.value === 'light') {
    setMode('dark')
    return
  }
  setMode('system')
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

<style scoped>
.theme-toggle {
  position: fixed;
  top: calc(12px + env(safe-area-inset-top));
  right: calc(14px + env(safe-area-inset-right));
  z-index: 2400;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  opacity: 0.94;
  transition:
    color 220ms ease,
    opacity 220ms ease,
    transform 220ms ease;
}

.theme-toggle:hover {
  color: var(--color-primary);
  opacity: 1;
  transform: translateY(-1px);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--color-primary-ring);
  outline-offset: 3px;
}

.theme-toggle svg {
  width: 22px;
  height: 22px;
  stroke-linecap: round;
  stroke-linejoin: round;
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

@media (max-width: 768px) {
  .theme-toggle {
    top: calc(10px + env(safe-area-inset-top));
    right: calc(10px + env(safe-area-inset-right));
  }
}

@media (prefers-reduced-motion: reduce) {
  .theme-toggle,
  .theme-icon-enter-active,
  .theme-icon-leave-active {
    transition: none;
  }
}
</style>
