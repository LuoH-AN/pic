<script setup lang="ts">
import { Images, Settings, Upload } from 'lucide-vue-next'

const route = useRoute()

const items = [
  { to: '/', label: '上传', icon: Upload },
  { to: '/file', label: '文件', icon: Images },
  { to: '/config', label: '配置', icon: Settings },
]

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <nav class="bottom-nav" aria-label="底部导航">
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :aria-label="item.label"
      :aria-current="isActive(item.to) ? 'page' : undefined"
      :title="item.label"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': isActive(item.to) }"
    >
      <span class="bottom-nav__pill">
        <component :is="item.icon" class="bottom-nav__icon" />
      </span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
/* Full-width fixed bottom bar with rounded top corners. The active icon sits
   inside a translucent "pill" — the rest are bare icons. Icon-only. */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-nav);
  width: min(66.667%, var(--page-max-w));
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: calc(56px + env(safe-area-inset-bottom));
  padding: 0 0.5rem env(safe-area-inset-bottom);
  background: color-mix(in oklab, var(--card) 90%, transparent);
  backdrop-filter: saturate(180%) blur(12px);
  border: 1px solid color-mix(in oklab, var(--border) 60%, transparent);
  border-radius: 1.5rem 1.5rem 0 0;
}

.bottom-nav__item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-foreground);
  transition: color var(--duration-base) ease;
}
.bottom-nav__item:hover {
  color: var(--foreground);
}
.bottom-nav__item--active,
.bottom-nav__item--active:hover {
  color: #3b82f6;
}

.bottom-nav__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
  transition: background-color var(--duration-base) ease;
}
.bottom-nav__item--active .bottom-nav__pill {
  background: color-mix(in oklab, #3b82f6 15%, transparent);
}

.bottom-nav__icon {
  width: 22px;
  height: 22px;
}
</style>
