<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
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
  methods: {
    onConfirm() {
      alert("Hey");
    },
  },
};
</script>

<template>
  <ModalListCreator
    v-model="isShow"
    title="List Invitation Creator"
    @confirm="onConfirm"
    confirm-btn-text="Close"
  >
    <slot></slot>
  </ModalListCreator>
</template>
