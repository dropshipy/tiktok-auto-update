<script>
import {
  AFFILIATE_BASE_URL,
  COUNTRY_CODE,
  SELLER_BASE_URL,
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
      optionCountry: [
        {
          label: "Indonesia",
          value: "ID",
        },
        {
          label: "Malaysia",
          value: "MY",
        },
      ],
      country: electronStore.get(COUNTRY_CODE),
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
    isShow() {
      this.country = electronStore.get(COUNTRY_CODE, this.country);
    },
  },
  mounted() {
    this.$store.commit("SET_LANGUAGE", this.country.value);
  },
  methods: {
    onConfirm() {
      electronStore.set(COUNTRY_CODE, this.country);
      this.$store.commit("SET_LANGUAGE", this.country.value);

      const sellerBaseUrl =
        this.country.value === "ID"
          ? "https://seller-id.tokopedia.com"
          : "https://seller-my.tiktok.com";

      const affiliateBaseUrl =
        this.country.value === "ID"
          ? "https://affiliate-id.tokopedia.com"
          : "https://affiliate.tiktok.com";

      electronStore.set(SELLER_BASE_URL, sellerBaseUrl);
      electronStore.set(AFFILIATE_BASE_URL, affiliateBaseUrl);

      this.isShow = false;
    },
  },
};
</script>

<template>
  <Modal
    :value="isShow"
    title="Select TikTok Country"
    @confirm="onConfirm"
    @input="isShow = $event"
  >
    <div class="mt-5 mb-10 space-y-3">
      <label
        v-for="(item, idx) in optionCountry"
        :key="idx"
        class="block cursor-pointer"
      >
        <input
          v-model="country"
          :value="item"
          type="radio"
          :id="'account-option-' + idx"
          name="account-option"
          class="mt-0.5 inline-block"
        />
        <label :for="'account-option-' + idx">{{ item.label }}</label>
      </label>
    </div>
  </Modal>
</template>
