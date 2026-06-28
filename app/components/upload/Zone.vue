<script setup lang="ts">
import { CloudUpload } from 'lucide-vue-next'

const { public: { maxUploadSizeMb } } = useRuntimeConfig()

const emit = defineEmits<{
  files: [files: File[]]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    emit('files', Array.from(target.files))
  }
  target.value = ''
}

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files) {
    emit('files', Array.from(event.dataTransfer.files))
  }
}
</script>

<template>
  <div
    class="upload-zone group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-input bg-card p-[52px_40px] text-center outline-none transition-all hover:-translate-y-px hover:border-primary hover:shadow-sm focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[drag-over=true]:scale-[1.004] data-[drag-over=true]:border-primary data-[drag-over=true]:bg-primary/10 data-[drag-over=true]:shadow-[0_14px_34px_var(--ring)] max-md:rounded-lg max-md:p-[42px_22px]"
    :data-drag-over="isDragOver"
    role="button"
    tabindex="0"
    aria-label="上传图片"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerFileInput"
    @keydown.enter.prevent="triggerFileInput"
    @keydown.space.prevent="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFileSelect"
    >

    <div class="upload-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-data-[drag-over=true]:opacity-100" aria-hidden="true" />

    <div class="relative flex flex-col items-center gap-3.5">
      <div
        class="flex size-[72px] items-center justify-center rounded-2xl text-white shadow-[0_14px_34px_var(--ring)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:scale-105 group-data-[drag-over=true]:-translate-y-0.5 group-data-[drag-over=true]:scale-105 max-md:size-16"
        style="background: var(--primary-gradient)"
      >
        <CloudUpload class="size-[34px] max-md:size-[30px]" />
      </div>

      <div class="flex flex-col gap-1">
        <p class="m-0 text-[17px] font-semibold text-foreground">
          拖拽图片到此处
        </p>
        <p class="m-0 text-sm text-muted-foreground">
          或<span class="mx-1 font-semibold text-primary">点击选择</span>文件
        </p>
      </div>

      <p class="m-0 mt-1 inline-block rounded-full bg-secondary px-3 py-1.5 text-[12.5px] text-muted-foreground">
        支持 JPG · PNG · WebP · AVIF · 单张 ≤ {{ maxUploadSizeMb }}MB
      </p>
    </div>
  </div>
</template>

<style scoped>
.upload-glow {
  background: radial-gradient(
    440px 220px at 50% -10%,
    color-mix(in oklab, var(--color-primary) 8%, transparent),
    transparent 70%
  );
}
</style>
