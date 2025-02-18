<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    list: {
      type: Array,
      default: () => [],
    },
    message: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      isLoading: false,
      isAuthenticated: false,
      qrCodeUrl: null,
      requestToSendMessage: false,
      intervalId: null,
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
    initClient() {
      console.log("init whatsapp client...");
      this.isLoading = true;

      window.whatsappAPI.initializeClient();

      window.whatsappAPI.onQR((url) => {
        this.qrCodeUrl = url;
        this.isLoading = false;
      });

      window.whatsappAPI.onAuthenticated((authenticated) => {
        console.log("onAuthenticated: ", authenticated);
        this.isAuthenticated = authenticated;
        this.isLoading = false;

        if (this.requestToSendMessage) {
          this.sendMessage();
          this.requestToSendMessage = false;
        }
      });
    },
    async sendMessage() {
      if (this.isAuthenticated && this.list) {
        for (const item of this.list) {
          const res = await window.whatsappAPI.sendMessage({
            phoneNumber: item.phoneNumber,
            message: this.message,
          });

          const isSuccess = res.status === "success";

          const snackbarType = isSuccess ? "success" : "error";
          this.$snackbar[snackbarType](`${res.message} ke ${item.name}`, {
            duration: 1000,
          });
          const delay = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        setTimeout(() => {
          this.isShow = false;
        }, 1000);
      }
    },
  },
  watch: {
    async isShow(_isShow) {
      if (_isShow) {
        this.isAuthenticated = await window.whatsappAPI.checkAuthStatus();
        if (this.isAuthenticated) {
          this.sendMessage();
        } else {
          this.initClient();
          this.requestToSendMessage = true;
        }
      } else {
        this.isAuthenticated = false;
        this.qrCodeUrl = null;
        this.isLoading = false;
      }
    },
  },
};
</script>

<template>
  <Modal v-model="isShow" title="Send whatsapp at once" hide-footer>
    <div
      v-if="isLoading"
      class="h-52 w-full flex flex-col items-center justify-center"
    >
      <Icon name="spinner" class="animate-spin mb-4" :size="24" />
      <p class="text-lg mt-4">Generating QR...</p>
    </div>
    <p v-else-if="isAuthenticated" class="text-lg">
      Authentication is successful, your message will be sent immediately
    </p>
    <div
      v-else-if="qrCodeUrl"
      class="flex flex-col items-center justify-center"
    >
      <img class="mx-auto" :src="qrCodeUrl" alt="QR Code" />
      <p class="mt-4 text-lg">Please scan the QR code and wait</p>
    </div>
  </Modal>
</template>
