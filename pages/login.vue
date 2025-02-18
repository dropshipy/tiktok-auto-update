<template>
  <div
    class="flex items-center justify-center min-h-screen p-4 bg-login-gradient"
  >
    <div
      class="w-full max-w-[480px] mx-auto h-max bg-white px-5 pb-8 pt-5 rounded-lg space-y-4"
    >
      <img
        :src="logoUrl"
        alt="logo"
        class="w-[120px] h-auto absolute left-10 top-10"
      />

      <h1 class="text-[40px] font-nunito text-dark2 font-bold leading-none">
        Login
      </h1>

      <p class="text-lg !mt-0">Please log in to your Account.</p>

      <Textfield
        v-model="email"
        label="Email"
        type="email"
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

      <Button @click="handleLogin" class="!mt-10 w-full hover:opacity-60"
        >Login</Button
      >
    </div>
  </div>
</template>

<script>
import {
  AFFILIATE_BASE_URL,
  COUNTRY_CODE,
  SELLER_BASE_URL,
} from "~/constants/store.constant";

export default {
  layout: "blank",
  data() {
    return {
      email: "",
      password: "",
      isShowPassword: false,
    };
  },
  methods: {
    async handleLogin() {
      if (!this.email || !this.password) {
        this.$snackbar.error("Please fill in all fields");
        return;
      }

      const payload = {
        email: this.email,
        password: this.password,
      };
      try {
        const response = await this.$axios.post(
          `${this.$config.apiBaseUrl}/users/authenticate`,
          payload
        );
        if (response?.status === 200) {
          window.electron.ipcRenderer.send("post-cookies-app", payload);
          const userData = response.data.user;

          localStorage.setItem("user_info", JSON.stringify(userData));

          const accountSubscription =
            electronStore.get("account-subscription") || {};
          electronStore.set("account-subscription", {
            ...accountSubscription,
            ...payload,
          });

          // init default country ID
          electronStore.set(COUNTRY_CODE, { value: "ID", label: "Indonesia" });
          electronStore.set(SELLER_BASE_URL, "https://seller-id.tokopedia.com");
          electronStore.set(
            AFFILIATE_BASE_URL,
            "https://affiliate-id.tokopedia.com"
          );

          setTimeout(() => {
            this.$router.push("/?from_login=true");
          }, 1000);
        }
      } catch (error) {
        if (error.response?.status === 400) {
          this.$snackbar.error("Form is incomplete");
        } else if (error.response?.status === 403) {
          this.$snackbar.error(
            "The email or password you entered is incorrect"
          );
        }
      }
    },
  },
  computed: {
    logoUrl() {
      const appName = this.$config.appName;
      return require(`~/assets/brand/${appName}.png`);
    },
  },
};
</script>
