<template>
  <UiFormCard
    title="图片压缩"
    :collapsed="!model.enabled && !isPanelLeaving"
  >
    <template #header-right>
      <div class="flex items-center gap-2">
        <span class="text-xs" :class="model.enabled ? 'text-primary' : 'text-muted-foreground'">
          {{ model.enabled ? '已启用' : '未启用' }}
        </span>
        <UiSwitch
          :model-value="model.enabled"
          aria-label="启用图片压缩"
          @update:model-value="model.enabled = $event"
        />
      </div>
    </template>

    <Transition
      name="expand-panel"
      @before-leave="handleBeforeLeave"
      @after-leave="handleAfterLeave"
    >
      <div v-if="model.enabled">
        <div v-if="model.format !== 'png'" class="flex flex-col gap-2">
          <UiLabel>压缩质量</UiLabel>
          <div class="flex items-center gap-2">
            <UiInput
              :model-value="qualityInput"
              type="text"
              inputmode="numeric"
              class="flex-1"
              @update:model-value="handleQualityInput"
              @blur="commitQualityInput"
            />
            <span class="text-sm text-muted-foreground">%</span>
          </div>
        </div>

        <div class="mt-5 flex flex-col gap-2">
          <UiLabel>输出格式</UiLabel>
          <UiRadioGroup
            :model-value="model.format"
            class="flex flex-wrap gap-3"
            @update:model-value="model.format = $event as CompressConfig['format']"
          >
            <UiLabel
              v-for="format in formats"
              :key="format"
              :for="`compress-format-${format}`"
              class="flex w-fit cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 transition"
              :class="model.format === format
                ? 'border-primary bg-primary/10'
                : 'hover:border-input hover:bg-secondary'"
            >
              <UiRadioGroupItem :id="`compress-format-${format}`" :value="format" />
              <span
                class="text-sm font-medium"
                :class="model.format === format ? 'text-primary' : 'text-secondary-foreground'"
              >{{ format.toUpperCase() }}</span>
            </UiLabel>
          </UiRadioGroup>
        </div>
      </div>
    </Transition>
  </UiFormCard>
</template>

<script setup lang="ts">
import type { CompressConfig } from '~~/types'

const model = defineModel<CompressConfig>({ required: true })
const formats = ['jpg', 'png', 'webp'] as const
const isPanelLeaving = ref(false)
const qualityInput = ref('')
const isEditingQuality = ref(false)

const normalizeQuality = (raw: unknown) => {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return 85
  return Math.max(1, Math.min(100, Math.round(parsed)))
}

const handleQualityInput = (value: string | number) => {
  isEditingQuality.value = true
  const digits = String(value ?? '').replace(/\D+/g, '').slice(0, 3)
  qualityInput.value = digits
}

const commitQualityInput = () => {
  const hasInput = qualityInput.value.trim().length > 0
  const next = hasInput ? normalizeQuality(qualityInput.value) : normalizeQuality(model.value.quality)
  model.value.quality = next
  qualityInput.value = String(next)
  isEditingQuality.value = false
}

watch(
  () => model.value.quality,
  (quality) => {
    if (isEditingQuality.value) return
    const next = normalizeQuality(quality)
    if (next !== quality) {
      model.value.quality = next
    }
    qualityInput.value = String(next)
  },
  { immediate: true },
)

const handleBeforeLeave = () => {
  isPanelLeaving.value = true
}

const handleAfterLeave = () => {
  isPanelLeaving.value = false
}
</script>
