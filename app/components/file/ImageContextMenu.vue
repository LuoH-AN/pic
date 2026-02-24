<template>
  <div
    v-if="modelValue"
    ref="menuEl"
    class="image-context-menu"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
    @click.stop
  >
    <button class="menu-btn copy" type="button" @click="emit('copy')">
      <span>复制链接</span>
    </button>
    <button class="menu-btn rename" type="button" @click="emit('rename')">
      <span>重命名</span>
    </button>
    <button class="menu-btn danger" type="button" @click="emit('delete')">
      <span>删除图片</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  position: { x: number; y: number }
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  copy: []
  rename: []
  delete: []
}>()

const menuEl = ref<HTMLElement | null>(null)

defineExpose({
  getMenuEl: () => menuEl.value,
})
</script>

<style scoped>
.image-context-menu {
  position: fixed;
  z-index: 2200;
  display: flex;
  flex-direction: column;
  min-width: 152px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 12px;
  padding: 4px 0;
  box-shadow: var(--shadow-soft);
}

.menu-btn {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  padding: 9px 14px;
  cursor: pointer;
}

.menu-btn + .menu-btn {
  border-top: 1px solid var(--color-border);
}

.menu-btn.copy { color: var(--color-primary); }
.menu-btn.rename { color: var(--color-success); }
.menu-btn.danger { color: var(--color-danger); }

.menu-btn:hover {
  background: var(--color-hover);
}
</style>
