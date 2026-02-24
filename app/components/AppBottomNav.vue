<template>
  <nav class="bottom-nav" aria-label="底部导航">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="nav-item"
      :class="{ active: isActive(item.to) }"
      :aria-label="item.label"
      :title="item.label"
    >
      <svg
        v-if="item.icon === 'home'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
      </svg>

      <svg
        v-else-if="item.icon === 'file'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 9h8" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </svg>

      <svg
        v-else
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <polyline points="7 12 10 15 17 8" />
      </svg>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const items = [
  { to: '/', label: '上传', icon: 'home' as const },
  { to: '/file', label: '文件', icon: 'file' as const },
  { to: '/config', label: '配置', icon: 'config' as const },
]

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 50%;
  bottom: calc(14px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 2300;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: color-mix(in oklab, var(--color-surface) 94%, transparent);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(10px);
}

.nav-item {
  width: 52px;
  height: 40px;
  border-radius: 14px;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.nav-item svg {
  width: 24px;
  height: 24px;
}

.nav-item:hover {
  color: var(--color-primary);
  background: var(--color-primary-soft);
}

.nav-item.active {
  color: var(--color-primary-strong);
  background: var(--color-primary-soft);
}

@media (max-width: 768px) {
  .bottom-nav {
    gap: 8px;
    padding: 6px 10px;
  }

  .nav-item {
    width: 46px;
    height: 36px;
    border-radius: 13px;
  }
}
</style>
