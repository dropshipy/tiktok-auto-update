<script>
import {
  TIKTOK_ACCOUNT_STORE_KEY,
  TIKTOK_COOKIES_ACCOUNT_STORE_KEY,
  TIKTOK_LIST_ACCOUNT_STORE_KEY,
} from "~/constants/store.constant";

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
      const accounts = electronStore.get(TIKTOK_LIST_ACCOUNT_STORE_KEY) || [];
      const account = electronStore.get(TIKTOK_ACCOUNT_STORE_KEY);
      const cookies = electronStore.get(TIKTOK_COOKIES_ACCOUNT_STORE_KEY) || [];

      if (account) {
        // LIST ACCOUNT
        const updatedAccounts = accounts.filter(
          (item) => item.email !== account.email
        );
        electronStore.set(TIKTOK_LIST_ACCOUNT_STORE_KEY, updatedAccounts);

        // SELECTED ACCOUNT
        electronStore.delete(TIKTOK_ACCOUNT_STORE_KEY);
        if (updatedAccounts.length != 0) {
          electronStore.set(
            TIKTOK_ACCOUNT_STORE_KEY,
            updatedAccounts[updatedAccounts.length - 1]
          );
        }

        // COOKIES
        const updatedCookies = cookies.filter(
          (item) => item.email !== account.email
        );
        electronStore.set(TIKTOK_COOKIES_ACCOUNT_STORE_KEY, updatedCookies);

        this.$snackbar.success(
          "Successfully deleted your TikTok account login session"
        );
      } else {
        this.$snackbar.error("Do not delete any accounts");
      }
      this.isShow = false;
    },
  },
};
</script>

<template>
  <Modal
    v-model="isShow"
    title="Delete TikTok Login Session"
    @confirm="onConfirm"
    confirm-btn-text="Delete"
  >
    <div class="mt-5 mb-10">
      Do you want to delete the login session info on your TikTok account?
    </div>
  </Modal>
</template>
