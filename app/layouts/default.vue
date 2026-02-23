<template>
  <div class="layout-shell">
    <slot />
    <AppBottomNav />
  </div>
</template>

<style scoped>
.layout-shell {
  min-height: 100vh;
  background: #faf8f5;
}
</style>
