<script>
export default {
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isChecked: this.value,
    };
  },
  methods: {
    updateParent() {
      this.$emit("input", this.isChecked);
    },
  },
  watch: {
    value(val) {
      this.isChecked = val;
    },
  }
};
</script>

<template>
  <label class="relative flex items-center">
    <input
      type="checkbox"
      v-model="isChecked"
      @change="updateParent"
      class="sr-only"
    />
    <div
      class="w-5 h-5 flex-shrink-0 border border-gray-400 rounded-md flex items-center justify-center cursor-pointer transition-colors duration-200"
      :class="{ 'bg-primary !border-transparent': isChecked }"
    >
      <svg
        class="w-4 h-4 text-blue-500 fill-current"
        viewBox="0 0 24 24"
        v-if="isChecked"
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" class="fill-white" />
      </svg>
    </div>
    <span class="ml-2 cursor-pointer">{{ label }}</span>
  </label>
</template>
