<script>
export default {
  props: {
    headers: {
      type: Array,
      default: () => [],
      required: true,
    },
    rows: {
      type: Array,
      default: () => [],
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loadingText: {
      type: String,
      default: "Loading...",
    },
    noDataText: {
      type: String,
      default: "Data not found",
    },
    showRowNumber: {
      type: Boolean,
      default: true,
    },
    showPagination: {
      type: Boolean,
      default: true,
    },
    pagination: {
      type: Object,
      default: () => ({
        currentPage: null,
        perPage: null,
        totalResults: null,
        totalPages: null,
      }),
    },
    selectable: {
      type: Boolean,
      default: false,
    },
    menuOptions: {
      type: Array,
      default: () => [],
    },
    classRow: {
      type: String,
      default: "whitespace-nowrap",
    },
  },
  data() {
    return {
      isShowOptions: false,
    };
  },
  methods: {
    getColumnWidth(headerWidth) {
      if (typeof headerWidth === "number") {
        return {
          maxWidth: `${headerWidth}px`,
          minWidth: `${headerWidth}px`,
        };
      }
    },
    onChangePagination(page) {
      this.$emit("change:page", page);
    },
    getRowNumber(idx) {
      return (
        (this.pagination.currentPage - 1) * this.pagination.perPage + idx + 1
      );
    },
    onSelectAll(e) {
      const checked = e.target.checked;
      this.internalRows.forEach((row) => {
        if (!row.disabled) {
          row.selected = checked;
        }
      });
    },
    onClickMenuOption(action) {
      action();
      this.isShowOptions = false;
    },
  },
  computed: {
    internalRows: {
      get() {
        return this.rows;
      },
      set(val) {
        this.$emit("update:rows", val);
      },
    },
    isAllSelected() {
      if (!this.internalRows.length) return false;
      const isSelectedAndEnabled = this.internalRows.some(
        (row) => row.selected && !row.disabled
      );
      const isEveryRowSelectedOrDisabled = this.internalRows.every(
        (row) => row.selected || row.disabled
      );
      return isSelectedAndEnabled && isEveryRowSelectedOrDisabled;
    },
    totalSelectedItems() {
      return this.internalRows.filter((row) => row.selected).length;
    },
  },
};
</script>

<template>
  <div>
    <div class="w-full overflow-x-auto overflow-y-hidden">
      <table class="border-collapse table-fixed bg-white min-w-full">
        <thead>
          <tr class="text-sm text-dark2 font-medium">
            <th
              v-if="selectable"
              class="px-2 py-3 text-left flex items-center gap-1"
              style="min-width: 60px"
            >
              <input
                type="checkbox"
                class="w-4 h-4 accent-primary"
                :checked="isAllSelected"
                @change="onSelectAll"
              />
              <div v-if="menuOptions.length" class="relative flex items-center">
                <button
                  @click.stop="isShowOptions = !isShowOptions"
                  :disabled="!totalSelectedItems"
                  class="disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Icon name="vertical-dots" class="text-gray-500" />
                </button>

                <Menu
                  v-model="isShowOptions"
                  position="bottom-left"
                  content-class="!overflow-visible"
                >
                  <MenuItem
                    v-for="(option, idx) in menuOptions"
                    :key="idx"
                    @click="() => onClickMenuOption(option.action)"
                    :class="option.action"
                  >
                    <span class="text-sm font-light text-gray-400">{{
                      option.label
                    }}</span>
                  </MenuItem>
                </Menu>
              </div>
            </th>
            <th
              v-if="showRowNumber"
              class="py-3 px-2 text-left"
              style="min-width: 50px"
            >
              No
            </th>

            <th
              v-for="(header, idx) in headers"
              :key="idx"
              class="py-3 px-2 select-none text-left"
              :style="getColumnWidth(header.width)"
            >
              {{ header.label }}
            </th>
          </tr>
        </thead>

        <tbody class="align-top">
          <tr v-if="!rows.length || loading">
            <td :colspan="headers.length + +showRowNumber + +selectable">
              <div
                class="flex flex-col items-center justify-center text-neutral-500 text-sm uppercase px-6 py-4"
              >
                <div v-if="loading" class="flex flex-col">
                  <slot name="loading">
                    <div class="flex items-center justify-center space-x-2">
                      <Icon
                        name="spinner"
                        :size="24"
                        class="animate-spin text-primary"
                      />
                      <span>{{ loadingText }}</span>
                    </div>
                  </slot>
                </div>

                <div v-else class="mt-2">
                  <slot name="empty">
                    {{ noDataText }}
                  </slot>
                </div>
              </div>
            </td>
          </tr>

          <template v-else>
            <tr
              v-for="(row, rowIdx) in rows"
              :key="rowIdx"
              :class="{ '!bg-primary/15': row.selected }"
            >
              <td v-if="selectable" class="p-2 text-left align-middle">
                <input
                  v-model="row.selected"
                  type="checkbox"
                  class="w-4 h-4 accent-primary disabled:opacity-50"
                  :disabled="row.disabled"
                />
              </td>
              <td
                v-if="showRowNumber"
                class="text-gray-500 text-sm whitespace-nowrap px-2 py-[14px]"
              >
                {{ getRowNumber(rowIdx) }}
              </td>

              <td
                v-for="(col, colIdx) in headers"
                :key="colIdx"
                :class="[
                  classRow,
                  'text-gray-500 text-sm px-2 py-[14px] overflow-ellipsis overflow-hidden',
                ]"
                :style="getColumnWidth(col.width)"
              >
                <slot :name="`col.${col.key}`" :row="row" :idx="rowIdx">
                  {{ row[col.key] || "-" }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div
      v-if="showPagination && pagination.totalResults"
      class="flex items-center py-2.5 px-5 bg-[#FBFBFD] transition-all"
      :class="totalSelectedItems ? 'justify-between' : 'justify-center'"
    >
      <span v-if="totalSelectedItems" class="text-base text-dark">
        {{ totalSelectedItems }} items selected
      </span>

      <Pagination
        :pagination="pagination"
        :max-displayed-pages="5"
        @change="onChangePagination"
      />
    </div>
  </div>
</template>

<style scoped>
th:first-child,
td:first-child {
  @apply !pl-5;
}

th:last-child,
td:last-child {
  @apply !pr-5;
}
</style>
