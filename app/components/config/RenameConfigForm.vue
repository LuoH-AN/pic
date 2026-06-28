<template>
  <UiFormCard title="重命名配置">
    <div class="flex flex-col gap-2">
      <UiLabel>重命名策略</UiLabel>
      <UiRadioGroup
        :model-value="model.strategy"
        class="flex gap-3"
        @update:model-value="model.strategy = $event as RenameConfig['strategy']"
      >
        <UiLabel
          v-for="option in strategies"
          :key="option.value"
          :for="`rename-strategy-${option.value}`"
          class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3 transition"
          :class="model.strategy === option.value
            ? 'border-primary bg-primary/10'
            : 'hover:border-input hover:bg-secondary'"
        >
          <UiRadioGroupItem :id="`rename-strategy-${option.value}`" :value="option.value" />
          <span
            class="text-sm font-medium"
            :class="model.strategy === option.value ? 'text-primary' : 'text-secondary-foreground'"
          >{{ option.label }}</span>
        </UiLabel>
      </UiRadioGroup>
    </div>

    <Transition name="expand-panel">
      <div v-if="model.strategy === 'custom'" class="flex flex-col gap-2">
        <UiLabel>自定义命名格式</UiLabel>
        <UiInput
          :model-value="model.customFormat"
          placeholder="album/{Y}/{m}/{filename}"
          @update:model-value="model.customFormat = String($event ?? '')"
        />
      </div>
    </Transition>
  </UiFormCard>
</template>

<script setup lang="ts">
import type { RenameConfig } from '~~/types'

const model = defineModel<RenameConfig>({ required: true })

const strategies = [
  { value: 'timestamp' as const, label: '时间戳' },
  { value: 'random' as const, label: '随机字符' },
  { value: 'custom' as const, label: '自定义' },
]

watch(
  () => model.value.customFormat,
  (value) => {
    if (model.value.strategy !== 'custom') return
    // Normalize backslashes to forward slashes and drop ASCII control chars + DEL.
    const sanitized = (value || '')
      .replace(/\\/g, '/')
      .split('')
      .filter((ch) => {
        const code = ch.charCodeAt(0)
        return code > 0x1F && code !== 0x7F
      })
      .join('')
    if (sanitized !== value) {
      model.value.customFormat = sanitized
    }
  },
)
</script>
