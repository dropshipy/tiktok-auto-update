<script>
import { TIKTOK_ACCOUNT_STORE_KEY } from "~/constants/store.constant";

export default {
  data() {
    return {
      config: null,
      iteration: 1,
      startPoint: 1,
      planName: "",
      planNumber: 1,
      endDate: "",
      comissionRate: 0,
      whatsappNumber: "",
      telegramNumber: "",
      lineNumber: "",
      facebookAccount: "",
      invitationMessage: "",
      showModalSubs: false,
      creatorStartPage: 1,
      language: "",
    };
  },
  computed: {
    userInfo() {
      return this.$store.getters["user/getUserInfo"];
    },
    hasConfig() {
      return !!this.config;
    },
    whatsapp() {
      return this.$config.appName === "tiksender"
        ? this.$config.tiksenderWhatsapp
        : this.$config.supportsellerWhatsapp;
    },
  },
  methods: {
    async getUserTikblastTargetedConfig() {
      try {
        const data = electronStore.get("targeted-config");
        if (data) {
          this.iteration = data.iteration;
          this.startPoint = data.startPoint;
          this.planName = data.planName;
          this.planNumber = data.planNumber;
          this.endDate = data.endDate;
          this.comissionRate = data.comissionRate;
          this.whatsappNumber = data.whatsappNumber;
          this.telegramNumber = data.telegramNumber;
          this.lineNumber = data.lineNumber;
          this.facebookAccount = data.facebookAccount;
          this.invitationMessage = data.invitationMessage;
          this.creatorStartPage = data.creatorStartPage;

          this.config = data;
        }
      } catch (error) {
        this.$snackbar.error("Failed to retrieve Tikblast configuration");
        console.error("Error getting tikblast config: ", error);
      }
    },
    async onSave() {
      if (!this.iteration || !this.invitationMessage) {
        this.$snackbar.error(
          "Failed to save. Please check your configuration."
        );
        return;
      }
      try {
        const payload = {
          iteration: +this.iteration,
          startPoint: +this.startPoint,
          planName: this.planName,
          planNumber: +this.planNumber,
          endDate: this.endDate,
          comissionRate: +this.comissionRate,
          whatsappNumber: this.whatsappNumber,
          telegramNumber: this.telegramNumber,
          lineNumber: this.lineNumber,
          facebookAccount: this.facebookAccount,
          invitationMessage: this.invitationMessage,
          userId: this.userInfo.id,
          subscriptionId: this.userInfo.subscriptionId,
          creatorStartPage: this.creatorStartPage,
        };
        electronStore.set("targeted-config", payload);
        this.$snackbar.success("Configuration saved successfully");
        this.getUserTikblastTargetedConfig();
      } catch (error) {
        this.$snackbar.error("Failed to save configuration");
        console.error("Error saving config: ", error);
      }
    },
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
        await window.electron.ipcRenderer.invoke(
          "targeted-collaboration",
          this.config
        );
      } else {
        this.$snackbar.error("Please fill in your TikTok account details");
        this.$nuxt.$emit("show-tiktok-account-modal");
      }
    },
    gotoWhatsappAdmin() {
      window.open(`https://wa.me/${this.whatsapp}`, "_blank");
    },
  },
  mounted() {
    this.language = this.$store.getters.getLanguage;
    this.$store.watch(
      (state) => state.language,
      (newValue, oldValue) => {
        console.log("Bahasa berubah:", oldValue, "→", newValue);
        this.language = newValue;
      }
    );

    if (this.userInfo?.subscriptionId) {
      this.getUserTikblastTargetedConfig();
    }
  },
};
</script>

<template>
  <Card>
    <h1 class="text-xl font-semibold text-dark2">
      Targeted Program Configuration
    </h1>

    <div v-if="userInfo?.subscriptionId">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-5">
        <div class="space-y-3">
          <h2 class="text-base font-medium text-dark3">Program Name</h2>
          <div class="grid grid-cols-12 gap-2">
            <Textfield v-model="planName" label="Name" class="col-span-9" />
            <Textfield
              v-model="planNumber"
              label="Number"
              type="number"
              class="col-span-3"
            />
          </div>

          <h2 class="text-base font-medium text-dark3 !mt-5">Package Period</h2>
          <Textfield
            v-model="endDate"
            label="End Date"
            placeholder="Select end date"
            type="date"
          />

          <h2 class="text-base font-medium text-dark3 !mt-5">
            Commission Percentage
          </h2>
          <Textfield
            v-model="comissionRate"
            label="Commission for Creator"
            placeholder="Enter percentage"
            type="number"
            suffix="%"
          />

          <h2 class="text-base font-medium text-dark3 !mt-5">
            Contact Information
          </h2>
          <Textfield
            v-model="whatsappNumber"
            label="WhatsApp Number"
            placeholder="Enter WhatsApp number"
          />
          <Textfield
            v-model="telegramNumber"
            label="Telegram Number"
            placeholder="Enter Telegram number"
          />

          <Textfield
            v-if="language === 'ID'"
            v-model="lineNumber"
            label="Line Number"
            placeholder="Enter Line number"
          />
          <Textfield
            v-else
            v-model="facebookAccount"
            label="Facebook"
            placeholder="Enter Facebook account"
          />
        </div>

        <div class="space-y-3">
          <h2 class="text-base font-medium text-dark3">
            Automation Bot Configuration
          </h2>
          <Textfield
            v-model="iteration"
            label="Number of Creators to Invite"
            placeholder="Enter number of creators"
            type="number"
          />
          <Textfield
            v-model="creatorStartPage"
            label="Start from creator page"
            placeholder="Enter page number"
            type="number"
          />

          <h2 class="text-base font-medium text-dark3 !mt-5">
            Targeted Collaboration Message
          </h2>
          <Textfield
            v-model="invitationMessage"
            label="Send Invitation Message to Affiliators"
            type="textarea"
            input-class="min-h-24"
            placeholder="Enter message"
            :max-height="400"
          >
            <template #label>
              <div class="flex items-center space-x-1 text-error ml-auto">
                <Icon name="warning" :size="14" />
                <span>Required</span>
              </div>
            </template>
          </Textfield>
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

    <div
      v-else-if="userInfo && !userInfo.subscriptionId"
      class="text-center font-medium mt-4 p-4 border border-secondary rounded-md"
    >
      You do not have an active subscription
    </div>

    <div v-else class="text-center mt-4 p-4 border border-secondary rounded-md">
      <p class="font-medium">You are not subscribed to Tiksender</p>
      <p class="mt-2 text-sm">*Contact the admin to start a subscription</p>
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
