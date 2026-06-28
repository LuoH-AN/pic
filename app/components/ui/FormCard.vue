<script setup lang="ts">
interface Props {
  title?: string
  collapsed?: boolean
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  collapsed: false,
})
</script>

<template>
  <UiCard>
    <UiCardHeader v-if="title || $slots['header-right']">
      <UiCardTitle v-if="title">{{ title }}</UiCardTitle>
      <UiCardAction v-if="$slots['header-right']">
        <slot name="header-right" />
      </UiCardAction>
    </UiCardHeader>

    <UiCardContent>
      <div class="flex flex-col gap-5">
        <slot />
      </div>
    </UiCardContent>
  </UiCard>
</template>
