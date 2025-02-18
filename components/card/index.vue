<script>
export default {
  props: {
    theme: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'secondary'].includes(value)
    },
  },
}
</script>

<template>
  <div class="card" :class="`card--${theme}`">
    <slot />
  </div>
</template>

<style scoped lang="postcss">
.card {
  @apply rounded-[10px];

  &--default {
    @apply shadow-card bg-white p-5;
  }

  &--primary {
    @apply bg-primary/5 bg-opacity-5 border border-primary/10;
  }

  &--secondary {
    @apply bg-secondary/5 bg-opacity-5 border border-secondary/10;
  }
}
</style>