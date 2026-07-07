<template>
  <UiFormCard title="重命名策略">
    <div class="rename-strategy">
      <UiLabel>命名方式</UiLabel>
      <div class="rename-pills">
        <button
          v-for="option in strategies"
          :key="option.value"
          type="button"
          class="rename-pill"
          :data-selected="model.strategy === option.value"
          :aria-pressed="model.strategy === option.value"
          @click="model.strategy = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <Transition name="expand-panel">
      <div v-if="model.strategy === 'custom'" class="rename-custom">
        <UiLabel>命名格式</UiLabel>
        <UiInput
          :model-value="model.customFormat"
          placeholder="album/{Y}/{m}/{filename}"
          @update:model-value="model.customFormat = String($event ?? '')"
        />
        <p class="rename-vars">
          可用变量：
          <code v-for="v in variables" :key="v" class="rename-var">{{ v }}</code>
        </p>
      </div>
    </Transition>

    <div class="rename-preview">
      <div class="rename-preview__head">
        <UiLabel>实时预览</UiLabel>
        <Eye class="rename-preview__eye" />
      </div>
      <div class="rename-preview__row">
        <FileImage class="rename-preview__icon" />
        <code class="rename-preview__name">{{ preview }}</code>
      </div>
    </div>
  </UiFormCard>
</template>

<script setup lang="ts">
import { Eye, FileImage } from 'lucide-vue-next'
import type { RenameConfig } from '~~/types'

const model = defineModel<RenameConfig>({ required: true })
const props = withDefaults(defineProps<{ extension?: string }>(), {
  extension: 'jpg',
})

const strategies = [
  { value: 'timestamp' as const, label: '时间戳' },
  { value: 'random' as const, label: '随机字符' },
  { value: 'custom' as const, label: '自定义' },
]

const variables = ['{Y}', '{m}', '{d}', '{timestamp}', '{filename}', '{str-8}']

// Deterministic sample so the preview never flickers between renders.
const SAMPLE_HEX = 'a3f9c2e1b7d84560'
const sampleHex = (len: number) => SAMPLE_HEX.slice(0, Math.max(1, len))

// Mirrors the server's placeholder subset (server/utils/filename.ts) so the
// preview matches what actually gets generated on upload.
const resolveCustom = (format: string) => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  let out = format.replace(/{str-(\d+)}/g, (_m, n) => sampleHex(Number(n) || 1))
  const replacements: Record<string, string> = {
    '{Y}': String(now.getFullYear()),
    '{y}': pad(now.getFullYear() % 100),
    '{m}': pad(now.getMonth() + 1),
    '{d}': pad(now.getDate()),
    '{h}': pad(now.getHours()),
    '{i}': pad(now.getMinutes()),
    '{s}': pad(now.getSeconds()),
    '{timestamp}': String(now.getTime()),
    '{filename}': 'sample',
  }
  for (const [token, value] of Object.entries(replacements)) {
    out = out.split(token).join(value)
  }
  return out || 'sample'
}

const preview = ref('')

const buildPreview = () => {
  let base = ''
  if (model.value.strategy === 'timestamp') {
    base = String(Date.now())
  } else if (model.value.strategy === 'random') {
    base = sampleHex(16)
  } else {
    base = resolveCustom(model.value.customFormat)
  }
  preview.value = `${base}.${props.extension}`
}

// Backslash → forward slash + drop ASCII control chars / DEL (matches server).
watch(
  () => model.value.customFormat,
  (value) => {
    if (model.value.strategy !== 'custom') return
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

// Built after mount so server/client render identically (no Date/Math churn).
onMounted(buildPreview)
watch(
  () => [model.value.strategy, model.value.customFormat, props.extension],
  buildPreview,
)
</script>

<style scoped>
.rename-strategy {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.rename-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.rename-pill {
  padding: 0.5rem 1.125rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--card);
  color: var(--muted-foreground);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition:
    border-color var(--duration-base) ease,
    background-color var(--duration-base) ease,
    color var(--duration-base) ease;
}
.rename-pill:hover {
  border-color: var(--primary);
  color: var(--foreground);
}
.rename-pill[data-selected='true'] {
  border-color: var(--primary);
  background: color-mix(in oklab, var(--primary) 10%, transparent);
  color: var(--primary);
}

.rename-custom {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.rename-vars {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--muted-foreground);
}
.rename-var {
  margin-right: 0.25rem;
  padding: 0.0625rem 0.3125rem;
  border-radius: var(--radius-sm);
  background: var(--secondary);
  font-size: var(--text-xs);
}

/* ── Live preview ───────────────────────────────────────────────── */
.rename-preview {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.875rem 1rem;
  background: var(--secondary);
  border-radius: var(--radius-lg);
}
.rename-preview__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.rename-preview__eye {
  width: 1rem;
  height: 1rem;
  color: var(--muted-foreground);
}
.rename-preview__row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}
.rename-preview__icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  color: var(--muted-foreground);
}
.rename-preview__name {
  font-size: var(--text-sm);
  color: var(--primary);
  word-break: break-all;
}
</style>
