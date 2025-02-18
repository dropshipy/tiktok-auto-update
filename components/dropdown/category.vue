<script>
import { OPTION_ALL } from "~/constants/option.constant";

export default {
  props: {
    label: {
      type: String,
      default: "",
    },
    items: {
      type: Array,
      default: () => [],
    },
    selectedItems: {
      type: Array,
      default: () => [],
    },
    value: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      isShow: false,
      OPTION_ALL,
    };
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
    sameItems() {
      return this.items.filter((item) =>
        this.selectedItems.includes(item.value)
      );
    },
    valueText() {
      if (this.sameItems.length) {
        return `${this.label} (${this.sameItems.length})`;
      }
      return this.label;
    },
    isAllSelected() {
      return this.sameItems.length === this.items.length;
    },
  },
  methods: {
    handleClickOption(item) {
      const itemValue = item.value;

      const payload = {
        mainCategory: this.label,
        subCategories: [],
      };

      if (itemValue === OPTION_ALL.value) {
        if (this.isAllSelected) {
          payload.subCategories = [];
        } else {
          payload.subCategories = this.items.map((item) => item.value);
        }
      } else {
        const currentItem = this.selectedItems.find((val) => val === itemValue);
        if (currentItem) {
          payload.subCategories = this.selectedItems.filter(
            (val) => val !== itemValue
          );
        } else {
          payload.subCategories = [...this.selectedItems, itemValue];
        }
      }

      this.$emit("change", payload);
    },
    isItemChecked(item) {
      return this.selectedItems.includes(item.value);
    },

    showDropdown() {
      this.isShow = true;
    },
    hideDropdown() {
      this.isShow = false;
    },
  },
  watch: {
    sameItems(_sameItems) {
      this.$emit("all-option-selected", {
        mainCategory: this.label,
        isAllSelected: this.isAllSelected,
      });
    },
  },
};
</script>

<template>
  <div
    class="group relative pb-3"
    @mouseenter="showDropdown"
    @mouseleave="hideDropdown"
  >
    <button
      type="button"
      class="text-sm px-3 py-2 rounded-md bg-[#F2FAFA] text-[#8291B0] group-hover:text-[#6ACAD0] border border-[#EBF9F9]"
      :class="{ '!text-[#6ACAD0] font-medium': value === label }"
      @click="handleClickOption(OPTION_ALL)"
    >
      {{ valueText }}
    </button>

    <Menu
      v-if="items.length"
      v-model="isShow"
      class="absolute left-0 top-[90%]"
    >
      <MenuItem @click="handleClickOption(OPTION_ALL)">
        <input
          type="checkbox"
          class="accent-primary w-4 h-4"
          :value="isAllSelected"
          :checked="isAllSelected"
        />
        <span class="text-sm">All</span>
      </MenuItem>

      <hr class="mx-4 my-1.5" />

      <MenuItem
        v-for="item in items"
        :key="item.value"
        @click="handleClickOption(item)"
      >
        <input
          type="checkbox"
          class="accent-primary w-4 h-4"
          :value="isItemChecked(item)"
          :checked="isItemChecked(item)"
        />
        <span class="text-sm">{{ item.label }}</span>
      </MenuItem>
    </Menu>
  </div>
</template>
