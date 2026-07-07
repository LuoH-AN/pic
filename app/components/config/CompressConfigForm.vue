<template>
  <UiFormCard title="图片压缩" :collapsed="!model.enabled">
    <template #header-right>
      <div class="compress-head__action">
        <span class="compress-head__status" :data-on="model.enabled">
          {{ model.enabled ? '已启用' : '未启用' }}
        </span>
        <UiSwitch
          :model-value="model.enabled"
          aria-label="启用图片压缩"
          @update:model-value="model.enabled = $event"
        />
      </div>
    </template>

    <div class="compress-body">
      <div v-if="model.format !== 'png'" class="compress-quality">
          <div class="compress-quality__top">
            <div>
              <UiLabel>压缩质量</UiLabel>
              <p class="compress-quality__hint">数值越低，体积越小</p>
            </div>
            <span class="compress-quality__value">{{ model.quality }}%</span>
          </div>

          <input
            type="range"
            min="1"
            max="100"
            step="1"
            :value="model.quality"
            class="compress-slider"
            :style="sliderStyle"
            aria-label="压缩质量"
            @input="onSliderInput"
          >
        </div>

        <div class="compress-format">
          <UiLabel>输出格式</UiLabel>
          <div class="compress-segmented" role="radiogroup" aria-label="输出格式">
            <button
              v-for="format in formats"
              :key="format"
              type="button"
              class="compress-segmented__btn"
              :data-selected="model.format === format"
              :aria-pressed="model.format === format"
              @click="model.format = format"
            >
              {{ format.toUpperCase() }}
            </button>
          </div>
        </div>
    </div>
  </UiFormCard>
</template>

<script setup lang="ts">
import type { CompressConfig } from '~~/types'

const model = defineModel<CompressConfig>({ required: true })
const formats = ['jpg', 'png', 'webp'] as const

// Drive a token-based progress fill on the slider track.
const sliderStyle = computed(() => ({
  '--progress': `${model.value.quality}%`,
}))

const onSliderInput = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  model.value.quality = Number.isFinite(value)
    ? Math.max(1, Math.min(100, Math.round(value)))
    : model.value.quality
}
</script>

<style scoped>
.compress-head__action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.compress-head__status {
  font-size: var(--text-xs);
  color: var(--muted-foreground);
}
.compress-head__status[data-on='true'] {
  color: var(--primary);
}

.compress-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Quality slider ─────────────────────────────────────────────── */
.compress-quality {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.compress-quality__top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}
.compress-quality__hint {
  margin: 0.125rem 0 0;
  font-size: var(--text-xs);
  color: var(--muted-foreground);
}
.compress-quality__value {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--primary);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.compress-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  margin: 0;
  height: 6px;
  border-radius: var(--radius-full);
  background: linear-gradient(
    to right,
    var(--primary) 0%,
    var(--primary) var(--progress, 80%),
    var(--input) var(--progress, 80%),
    var(--input) 100%
  );
  outline: none;
  cursor: pointer;
}
.compress-slider:focus-visible {
  box-shadow: 0 0 0 var(--ring-w) var(--ring-blur-color);
}
.compress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid var(--background);
  border-radius: var(--radius-full);
  background: var(--foreground);
  box-shadow: 0 1px 3px color-mix(in oklab, var(--foreground) 30%, transparent);
  cursor: pointer;
  transition: transform var(--duration-fast) ease;
}
.compress-slider:active::-webkit-slider-thumb {
  transform: scale(1.2);
}
/* Firefox: track + progress pseudos cover the gradient, so the fill works
   cross-browser without the element background leaking through. */
.compress-slider::-moz-range-track {
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--input);
}
.compress-slider::-moz-range-progress {
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--primary);
}
.compress-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: 2px solid var(--background);
  border-radius: var(--radius-full);
  background: var(--foreground);
  cursor: pointer;
}

/* ── Format segmented control ───────────────────────────────────── */
.compress-format {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}
.compress-segmented {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: var(--muted);
  border-radius: var(--radius-md);
}
.compress-segmented__btn {
  min-width: 4rem;
  padding: 0.375rem 0.875rem;
  border: 0;
  border-radius: calc(var(--radius-md) - 2px);
  background: transparent;
  color: var(--muted-foreground);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition:
    background-color var(--duration-base) ease,
    color var(--duration-base) ease,
    box-shadow var(--duration-base) ease;
}
.compress-segmented__btn:hover {
  color: var(--foreground);
}
.compress-segmented__btn[data-selected='true'] {
  background: var(--card);
  color: var(--foreground);
  box-shadow: 0 1px 2px color-mix(in oklab, var(--foreground) 12%, transparent);
}
</style>
