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
    class="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-input bg-card p-[52px_40px] text-center outline-none transition-colors hover:border-foreground hover:bg-accent/50 focus-visible:border-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[drag-over=true]:border-foreground data-[drag-over=true]:bg-accent/50 max-md:rounded-lg max-md:p-[42px_22px]"
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

    <div class="relative flex flex-col items-center gap-4">
      <div
        class="flex size-[68px] items-center justify-center rounded-2xl border bg-background text-foreground transition-colors group-hover:border-foreground group-data-[drag-over=true]:border-foreground max-md:size-16"
      >
        <CloudUpload class="size-7 max-md:size-6" />
      </div>

      <div class="flex flex-col gap-1">
        <p class="m-0 text-[17px] font-semibold text-foreground">
          拖拽图片到此处
        </p>
        <p class="m-0 text-sm text-muted-foreground">
          或<span class="mx-1 font-medium text-foreground underline-offset-2 group-hover:underline">点击选择</span>文件
        </p>
      </div>

      <p class="m-0 inline-block rounded-full bg-secondary px-3 py-1.5 text-[12.5px] text-muted-foreground">
        支持 JPG · PNG · WebP · AVIF · 单张 ≤ {{ maxUploadSizeMb }}MB
      </p>
    </div>
  </div>
</template>
