<script>
export default {
  props: {
    theme: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'tertiary', 'primary-outline', 'blue-outline'].includes(value)
    }
  },
  computed: {
    buttonClasses() {
      switch (this.theme) {
        case 'primary':
          return 'bg-primary text-white font-bold';
        case 'primary-outline':
          return 'text-primary font-medium border border-primary';
        case 'tertiary':
          return 'text-dark font-medium';
        case 'secondary':
          return 'bg-secondary text-white font-bold';
        case 'blue-outline':
          return 'text-blue font-medium border border-blue';
      }
    }
  }
}
</script>

<template>
  <button v-bind="$attrs" v-on="$listeners"
    class="flex items-center justify-center space-x-2 text-sm py-2 px-4 rounded-lg transition-all disabled:pointer-events-none disabled:opacity-30"
    :class="buttonClasses">
    <slot />
  </button>
</template>