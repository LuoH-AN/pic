<template>
  <div class="min-h-screen bg-background">
    <ThemeModeToggle v-if="showThemeToggle" />
    <slot />
    <AppBottomNav />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const showThemeToggle = computed(() => route.path === '/')
</script>
