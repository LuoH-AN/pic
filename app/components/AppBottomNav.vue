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
        stroke-width="1.9"
      >
        <path d="M12 16V5" />
        <path d="m7.5 9 4.5-4 4.5 4" />
        <path d="M4 18.5v.5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-.5" />
      </svg>

      <svg
        v-else-if="item.icon === 'file'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
      >
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <circle cx="9" cy="10" r="1.2" />
        <path d="m21 15-4.5-4.5L8 19" />
      </svg>

      <svg
        v-else
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.9"
      >
        <line x1="5" y1="7" x2="19" y2="7" />
        <circle cx="9" cy="7" r="1.7" />
        <line x1="5" y1="12" x2="19" y2="12" />
        <circle cx="15" cy="12" r="1.7" />
        <line x1="5" y1="17" x2="19" y2="17" />
        <circle cx="11" cy="17" r="1.7" />
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
  bottom: calc(12px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 2300;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 9px;
  border-radius: 999px;
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  box-shadow: none;
}

.nav-item {
  width: 44px;
  height: 34px;
  border-radius: 999px;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.nav-item svg {
  width: 20px;
  height: 20px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-item:hover {
  color: var(--color-primary);
  background: var(--color-hover);
  transform: translateY(-1px);
}

.nav-item.active {
  color: var(--color-primary-strong);
  background: var(--color-primary-surface);
  box-shadow: inset 0 0 0 1px var(--color-primary-ring);
}

.nav-item:focus-visible {
  outline: 2px solid var(--color-primary-ring);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .bottom-nav {
    bottom: calc(10px + env(safe-area-inset-bottom));
    gap: 5px;
    padding: 6px 7px;
  }

  .nav-item {
    width: 40px;
    height: 30px;
    border-radius: 999px;
  }

  .nav-item svg {
    width: 18px;
    height: 18px;
  }
}
</style>
