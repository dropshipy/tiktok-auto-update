<script>
import {
  TIKTOK_ACCOUNT_STORE_KEY,
  TIKTOK_LIST_ACCOUNT_STORE_KEY,
} from "~/constants/store.constant";

export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      email: "",
      password: "",
      isShowPassword: false,
    };
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
      const { email, password } = this;
      let accounts = electronStore.get(TIKTOK_LIST_ACCOUNT_STORE_KEY) || [];

      if (!email || !password) {
        this.$snackbar.error("Form is incomplete");
        return;
      }

      const emailIndex = accounts.findIndex((item) => item.email === email);

      if (emailIndex !== -1) {
        if (accounts[emailIndex].password !== password) {
          accounts[emailIndex].password = password;
          this.$snackbar.success("Password updated successfully");
        } else {
          this.$snackbar.success(
            "Account already exists with the same password"
          );
        }
      } else {
        const payload = { email, password };
        accounts.push(payload);
        this.$snackbar.success("Successfully saved TikTok account information");
      }

      electronStore.set(TIKTOK_LIST_ACCOUNT_STORE_KEY, accounts);
      electronStore.set(TIKTOK_ACCOUNT_STORE_KEY, { email, password });

      this.isShow = false;
    },
    getTiktokAccount() {
      const data = electronStore.get(TIKTOK_ACCOUNT_STORE_KEY);
      if (data) {
        this.email = data.email;
        this.password = data.password;
      }
    },
    reset() {
      this.email = "";
      this.password = "";
    },
    showModal() {
      this.isShow = true;
    },
  },
  watch: {
    isShow(val) {
      if (val) {
        this.getTiktokAccount();
      }
    },
  },
  mounted() {
    this.$nuxt.$on("show-tiktok-account-modal", this.showModal);
  },
  beforeDestroy() {
    this.$nuxt.$off("show-tiktok-account-modal", this.showModal);
  },
};
</script>

<template>
  <Modal
    v-model="isShow"
    title="Tiktok Account"
    @confirm="onConfirm"
    @close="reset"
  >
    <div class="mt-5 mb-10 space-y-3">
      <Textfield
        v-model="email"
        label="Email"
        placeholder="Enter your email here"
      />
      <Textfield
        v-model="password"
        label="Password"
        placeholder="Enter your password here"
        :type="isShowPassword ? 'text' : 'password'"
        @click:icon="isShowPassword = !isShowPassword"
        :icon="isShowPassword ? 'eye-show' : 'eye-hide'"
      />
    </div>
  </Modal>
</template>
