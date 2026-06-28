<script setup lang="ts">
import { Images, Settings, Upload } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const route = useRoute()

const items = [
  { to: '/', label: '上传', icon: 'home' as const },
  { to: '/file', label: '文件', icon: 'file' as const },
  { to: '/config', label: '配置', icon: 'config' as const },
]

const iconMap = {
  home: Upload,
  file: Images,
  config: Settings,
}

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <nav
    aria-label="底部导航"
    class="fixed bottom-[calc(12px+env(safe-area-inset-bottom))] left-1/2 z-[2300] flex -translate-x-1/2 items-center gap-1 rounded-full border bg-card px-2 py-1.5"
  >
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :aria-label="item.label"
      :title="item.label"
      :class="cn(
        'flex h-9 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        isActive(item.to) && 'bg-foreground text-background hover:bg-foreground hover:text-background',
      )"
    >
      <component :is="iconMap[item.icon]" class="size-5" />
    </NuxtLink>
  </nav>
</template>
