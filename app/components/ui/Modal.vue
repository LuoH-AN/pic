<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  showClose?: boolean
  contentClass?: string
  bodyClass?: string
  footerClass?: string
}

withDefaults(defineProps<Props>(), {
  showClose: true,
  contentClass: '',
  bodyClass: '',
  footerClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <UiDialog :open="modelValue" @update:open="emit('update:modelValue', $event)">
    <UiDialogContent :show-close="showClose" :class="contentClass">
      <UiDialogHeader>
        <UiDialogTitle>{{ title }}</UiDialogTitle>
      </UiDialogHeader>

      <div :class="bodyClass">
        <slot />
      </div>

      <UiDialogFooter v-if="$slots.footer" :class="footerClass">
        <slot name="footer" />
      </UiDialogFooter>
    </UiDialogContent>
  </UiDialog>
</template>
