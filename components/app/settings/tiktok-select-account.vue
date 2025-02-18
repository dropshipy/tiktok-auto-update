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
      optionAccounts: [],
      account: { email: "", password: "" },
    };
  },
  computed: {
    isShow: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  watch: {
    isShow(newVal) {
      if (newVal) {
        this.loadSelectedAccount();
      }
    },
  },
  methods: {
    loadSelectedAccount() {
      const savedAccount = electronStore.get(TIKTOK_ACCOUNT_STORE_KEY);
      this.optionAccounts =
        electronStore.get(TIKTOK_LIST_ACCOUNT_STORE_KEY) || [];
      this.account = savedAccount || { email: "", password: "" };
    },
    onConfirm() {
      electronStore.set(TIKTOK_ACCOUNT_STORE_KEY, this.account);
      this.isShow = false;
    },
  },
};
</script>

<template>
  <Modal
    :value="isShow"
    title="Select TikTok Account"
    @confirm="onConfirm"
    @input="isShow = $event"
  >
    <div class="mt-5 mb-10 space-y-3" v-if="optionAccounts.length != 0">
      <label
        v-for="(item, idx) in optionAccounts"
        :key="idx"
        class="block cursor-pointer"
      >
        <input
          v-model="account.email"
          :value="item.email"
          type="radio"
          :id="'account-option-' + idx"
          name="account-option"
          class="mt-0.5 inline-block"
        />
        <label :for="'account-option-' + idx">{{ item.email }}</label>
      </label>
    </div>

    <div v-else class="mt-5 mb-10">You don't have an account saved.</div>
  </Modal>
</template>
