<script>
import Teleport from "vue2-teleport";

export default {
  components: {
    Teleport,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    modalClass: {
      type: String,
      default: "",
    },
    value: {
      type: Boolean,
      default: false,
    },
    hideFooter: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    onClose() {
      this.isShow = false;
      this.$emit("close");
    },
  },

  computed: {
    isShow: {
      get: function () {
        return this.value;
      },
      set: function (val) {
        this.$emit("input", val);
      },
    },
  },
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isShow" class="modal__overlay" @click="onClose">
        <div class="modal" :class="modalClass" @click.stop>
          <div class="flex items-center justify-between">
            <h3 class="modal__title">{{ title || "Title" }}</h3>
            <Icon name="close" @clickIcon="onClose" class="cursor-pointer" />
            <!-- <p >Close</p> -->
          </div>
          <div class="modal__content">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="postcss">
.modal {
  @apply w-full max-w-[500px] bg-white transition-all p-6 rounded-xl shadow;

  &__overlay {
    @apply flex items-center justify-center fixed z-50 top-0 left-0 w-full h-full bg-black bg-opacity-40;
  }

  &__title {
    @apply text-xl font-medium;
  }

  &__content {
    @apply mt-4;
  }

  &__footer {
    @apply flex items-center justify-end space-x-4;
  }
}

.modal-enter-active,
.modal-leave-active {
  @apply transition-all;
}

.modal-enter .modal,
.modal-leave-to .modal {
  @apply scale-50 opacity-0;
}
</style>
