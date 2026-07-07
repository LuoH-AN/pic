<template>
  <div class="layout-default">
    <ThemeModeToggle />
    <slot />
    <AppBottomNav />
  </div>
</template>

<style scoped>
.layout-default {
  min-height: 100vh;
}
</style>
