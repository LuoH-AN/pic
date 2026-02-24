<template>
  <div class="layout-shell">
    <ThemeModeToggle v-if="showThemeToggle" />
    <slot />
    <AppBottomNav />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const showThemeToggle = computed(() => route.path === '/')
</script>

<style scoped>
.layout-shell {
  min-height: 100vh;
  background: var(--color-page-bg);
}
</style>
