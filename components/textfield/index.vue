<script>
export default {
  props: {
    id: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    iconSize: {
      type: Number,
      default: 24,
    },
    value: {
      type: [String, Number],
      default: "",
    },
    maxHeight: {
      type: Number,
      default: 44,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    inputClass: {
      type: [String, Array, Object],
      default: "",
    },
    suffix: {
      type: String,
      default: "",
    },
    limit: {
      type: Number,
      default: 2000,
    },
    inputNumberMin: {
      type: Number,
      default: 0,
    },
  },
};
</script>

<template>
  <div>
    <label
      class="flex items-center gap-3 flex-wrap text-dark2 mb-3"
      v-if="label"
      :for="id"
    >
      <span>{{ label }}</span>
      <slot name="label" />
    </label>
    <div class="relative !text-dark2" @click.stop="$emit('click')">
      <template v-if="type === 'textarea'">
        <textarea
          :value="value"
          :type="type"
          :placeholder="placeholder"
          @input="$emit('input', $event.target.value)"
          @change="$emit('change', $event.target.value)"
          :id="id"
          class="input-field"
          :class="[inputClass, { '!pr-9': icon }]"
          :style="{ maxHeight: `${maxHeight}px` }"
          :readonly="readonly"
          :maxlength="limit"
        >
        </textarea>

        <span v-if="value" class="absolute bottom-3 right-2 bg-white/80 text-xs"
          >{{ value.length }}/{{ limit }}</span
        >
      </template>

      <input
        v-else
        :value="value"
        :type="type"
        :min="inputNumberMin"
        :placeholder="placeholder"
        @input="$emit('input', $event.target.value)"
        @change="$emit('change', $event.target.value)"
        :id="id"
        class="input-field"
        :class="[inputClass, { '!pr-9': icon }]"
        :style="{ maxHeight: `${maxHeight}px` }"
        :readonly="readonly"
      />

      <button
        v-if="icon"
        class="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A3BD]"
        @click.stop="$emit('click:icon')"
      >
        <Icon :size="iconSize" :name="icon" />
      </button>

      <span
        v-else-if="suffix"
        class="font-semibold absolute top-1/2 -translate-y-1/2"
        :class="type === 'text' ? 'right-3' : 'right-8'"
      >
        {{ suffix }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply border !border-[#A0A3BD] !border-opacity-40 focus:outline-none focus:ring-2 focus:ring-primary p-3 w-full rounded-[6px] text-base;
}
</style>
