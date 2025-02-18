<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      isExpanded: true,
    };
  },
  created() {
    try {
      const userInfo = JSON.parse(localStorage.getItem("user_info"));
      if (userInfo) {
        const flaggingUserCountry = {
          country: this.language,
          ...userInfo,
        };
        this.$store.commit("user/setUserInfo", flaggingUserCountry);
      } else {
        this.$router.push("/login");
      }
    } catch (error) {
      console.log("Error parsing user info: ", error);
    }
  },
  computed: {
    ...mapGetters({
      language: "getLanguage",
    }),
    isSupportSeller() {
      return this.$config.appName === "supportseller";
    },
  },
  mounted() {
    const userData = this.$store.getters["user/getUserInfo"];
    if (this.$route.query.from_login) {
      this.$snackbar.success(`Welcome, ${userData?.fullName}`);
    }

    setTimeout(() => {
      const subscriptionStoreData = electronStore.get("account-subscription");

      if (!subscriptionStoreData?.email || !subscriptionStoreData?.password) {
        this.$router.replace("/login");
        return;
      }

      this.fetchUserSubscription();
    }, 500);
  },
  methods: {
    async fetchUserSubscription() {
      try {
        const resData = await window.electron.ipcRenderer.invoke(
          "get-subscription-info"
        );

        if (resData?.data) {
          this.$store.commit("subscription/setSubscriptionInfo", resData.data);
        }
      } catch (error) {
        this.$snackbar.error("Gagal mengambil informasi subscription");
        console.error("Error getting subscription info:", error);
      }
    },
  },
};
</script>

<template>
  <div>
    <LayoutSidebar @expanded="isExpanded = $event" />

    <div
      class="transition-all"
      :class="isExpanded ? 'ml-[300px]' : 'ml-[84px]'"
    >
      <LayoutNavbar />

      <main
        :class="[isSupportSeller ? 'bg-[#D7F0F2]' : 'bg-light']"
        class="min-h-[calc(100vh-72px)] p-8"
      >
        <Nuxt />
      </main>
    </div>

    <Snackbar />
  </div>
</template>
