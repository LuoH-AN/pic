<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  collapsed?: boolean
}

withDefaults(defineProps<Props>(), {
  title: undefined,
  subtitle: undefined,
  collapsed: false,
})
</script>

<template>
  <section class="section">
    <header
      v-if="title || subtitle || $slots['header-right'] || $slots.icon"
      class="section__head"
    >
      <div class="section__heading">
        <span v-if="$slots.icon" class="section__icon">
          <slot name="icon" />
        </span>
        <div class="section__titles">
          <h2 v-if="title" class="section__title">{{ title }}</h2>
          <p v-if="subtitle" class="section__subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <div v-if="$slots['header-right']" class="section__action">
        <slot name="header-right" />
      </div>
    </header>

    <div class="section__body" :data-collapsed="collapsed">
      <div class="section__body-inner">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Section card: bordered surface with a tinted header bar carrying icon +
   title, and a padded body slot for the form fields. */
.section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  background: var(--muted);
  border-bottom: 1px solid var(--border);
}

.section__heading {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.section__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}
.section__icon :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}

.section__titles {
  min-width: 0;
}
.section__title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--foreground);
}
.section__subtitle {
  margin: 0.125rem 0 0;
  font-size: var(--text-xs);
  color: var(--muted-foreground);
}

.section__action {
  flex-shrink: 0;
}

.section__body {
  /* Collapsible wrapper: grid-template-rows animates between 1fr and 0fr,
     smoothly growing/shrinking the inner content (incl. padding). The
     inner block is overflow-clipped so it disappears with the rows.
     min-height:0 is essential — without it the grid row's default
     `min-height:auto` keeps the row tall enough to fit the content,
     defeating the 0fr collapse. */
  display: grid;
  grid-template-rows: 1fr;
  min-height: 0;
  transition: grid-template-rows var(--duration-slow) var(--ease);
}
.section__body[data-collapsed='true'] {
  grid-template-rows: 0fr;
}
.section__body-inner {
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem 1.25rem;
}
@media (max-width: 767px) {
  .section__body-inner {
    padding: 1.25rem 1rem;
  }
}
</style>
