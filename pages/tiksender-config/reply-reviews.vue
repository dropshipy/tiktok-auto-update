<script>
import { TIKTOK_ACCOUNT_STORE_KEY } from "~/constants/store.constant";

export default {
  data() {
    return {
      config: {
        iteration: 1,
        productName: "",
        message: "",
        productRatings: [
          { label: "5", key: 5, value: false },
          { label: "4", key: 4, value: false },
          { label: "3", key: 3, value: false },
          { label: "2", key: 2, value: false },
          { label: "1", key: 1, value: false },
        ],

        typeOfAssessment: [
          { label: "With follow-up", key: "has_follow_review", value: false },
          { label: "With comments", key: "is_text_reviewed", value: false },
          { label: "With photos", key: "has_photos", value: false },
          { label: "With videos", key: "has_video", value: false },
        ],
      },
      showModalSubs: false,
    };
  },
  computed: {
    userInfo() {
      return this.$store.getters["user/getUserInfo"];
    },
    whatsapp() {
      return this.$config.appName === "tiksender"
        ? this.$config.tiksenderWhatsapp
        : this.$config.supportsellerWhatsapp;
    },
  },
  mounted() {
    this.getReplyReviewsConfig();
  },
  methods: {
    async onStart() {
      const getSubscription = await this.$store.dispatch(
        "subscription/setSelectedSubscription",
        "premium"
      );
      if (!getSubscription) {
        this.showModalSubs = true;
        return;
      }

      const tiktokAccount = electronStore.get(TIKTOK_ACCOUNT_STORE_KEY);
      if (tiktokAccount?.email && tiktokAccount?.password) {
        if (this.config.iteration < 1) {
          this.$snackbar.error("Iterations cannot be less than 1");
          return;
        }
        const rating = this.productRatingsFormat();
        const typeAssessment = this.typeOfAssessmentFormat();

        const { productName, iteration, message } = this.config;
        if (!message) {
          this.$snackbar.error("Reply message cannot be empty");
          return;
        }
        const context = {
          productName,
          iteration,
          rating,
          typeAssessment,
          message,
        };
        await window.electron.ipcRenderer.invoke(
          "start-replying-to-reviews",
          context
        );
      } else {
        this.$snackbar.error("Please enter your TikTok account details");
        this.$nuxt.$emit("show-tiktok-account-modal");
      }
    },
    async onSave() {
      try {
        const config = {
          iteration: this.config.iteration,
          productName: this.config.productName,
          message: this.config.message,
        };
        electronStore.set("reply-reviews-config", config);
        this.$snackbar.success("Configuration saved successfully");
      } catch (error) {
        this.$snackbar.error("Failed to save configuration");
        console.error("Error saving config: ", error);
      }
    },
    getReplyReviewsConfig() {
      const getConfig = electronStore.get("reply-reviews-config");
      if (getConfig) {
        this.config = {
          ...this.config,
          iteration: getConfig.iteration,
          productName: getConfig.productName,
          message: getConfig.message,
        };
      }
    },
    productRatingsFormat() {
      return this.config.productRatings
        .filter((item) => item.value)
        .map((item) => item.key);
    },
    typeOfAssessmentFormat() {
      return this.config.typeOfAssessment
        .filter((item) => item.value)
        .map((item) => ({ [item.key]: true }));
    },
    gotoWhatsappAdmin() {
      window.open(`https://wa.me/${this.whatsapp}`, "_blank");
    },
  },
};
</script>

<template>
  <Card>
    <h1 class="text-xl font-semibold text-dark2">
      Automated Review Reply Configuration
    </h1>

    <div v-if="userInfo?.subscriptionId">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-5">
        <div class="space-y-5">
          <Textfield
            v-model="config.iteration"
            label="Number of Automation Iterations"
            placeholder="Enter the number of iterations"
            type="number"
          />
        </div>
        <Textfield
          v-model="config.productName"
          label="Search Orders"
          placeholder="Order ID, product name/ID, or username"
          type="text"
        />
        <div class="">
          <p>Type of Assessment</p>
          <div class="grid grid-cols-2 gap-3 mt-4">
            <section
              class="flex items-center"
              v-for="(item, index) in config.typeOfAssessment"
              :key="index"
            >
              <Checkbox :label="item.label" v-model="item.value" />
            </section>
          </div>
        </div>
        <Textfield
          v-model="config.message"
          label="Reply Message"
          type="textarea"
          input-class="min-h-24"
          placeholder="Enter message"
          :max-height="300"
          :limit="300"
        >
          <template #label>
            <div class="flex items-center space-x-1 text-error ml-auto">
              <Icon name="warning" :size="14" />
              <span>Required</span>
            </div>
          </template>
        </Textfield>
        <div class="-mt-10">
          <p>Product Ratings</p>
          <div class="flex gap-5 flex-wrap mt-5">
            <section
              class="flex items-center"
              v-for="(item, index) in config.productRatings"
              :key="index"
            >
              <Checkbox :label="item.label" v-model="item.value" />
              <Icon
                name="star"
                :size="16"
                viewBox="0 0 14 13"
                class="text-yellow ml-1"
              />
            </section>
          </div>
        </div>

        <div class="flex items-center justify-end mt-10 gap-2.5">
          <Button
            class="w-full max-w-[140px]"
            theme="primary-outline"
            @click="onSave"
            >Save</Button
          >
          <Button class="w-full max-w-[140px]" @click="onStart">Start</Button>
        </div>
      </div>
    </div>

    <div
      v-else-if="userInfo && !userInfo.subscriptionId"
      class="text-center font-medium mt-4 p-4 border border-secondary rounded-md"
    >
      You do not have an active subscription
    </div>

    <div v-else class="text-center mt-4 p-4 border border-secondary rounded-md">
      <p class="font-medium">You are not subscribed yet</p>
      <p class="mt-2 text-sm">*Contact admin to start a subscription</p>
    </div>

    <Modal
      v-model="showModalSubs"
      title="You are not subscribed. Contact admin on WhatsApp?"
      @confirm="gotoWhatsappAdmin"
      confirm-btn-text="Yes"
    >
    </Modal>
  </Card>
</template>
