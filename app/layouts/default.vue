<template>
  <div class="layout-shell">
    <slot />
    <AppBottomNav />
  </div>
</template>

<style scoped>
.layout-shell {
  min-height: 100vh;
  background: var(--color-page-bg);
}
</style>
