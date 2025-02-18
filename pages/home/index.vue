<script>
import formatDate from "~/utils/format-date";
import formatCurrency from "~/utils/format-currency";
import copyToClipboard from "~/utils/copy-to-clipboard";

export default {
  data() {
    return {
      isLoadingGetSubscription: false,
    };
  },
  computed: {
    website() {
      return this.$config.appName === "tiksender"
        ? this.$config.tiksenderWebsite
        : this.$config.supportsellerWebsite;
    },
    whatsapp() {
      return this.$config.appName === "tiksender"
        ? this.$config.tiksenderWhatsapp
        : this.$config.supportsellerWhatsapp;
    },
    userInfo() {
      return this.$store.getters["user/getUserInfo"] || {};
    },
    subscriptions() {
      return this.$store.getters["subscription/getSubscriptionInfo"];
    },
    dataProfile() {
      return [
        { icon: "profile", value: this.userInfo.fullName || "-" },
        { icon: "email", value: this.userInfo.email || "-" },
        { icon: "phone", value: this.userInfo.phoneNumber || "-" },
      ];
    },
  },
  methods: {
    // getStatusLabel(status) {
    //   if (status === "active") return "Aktif";
    //   if (status === "register") return "Belum aktif";
    //   if (status === "inactive") return "Tidak aktif";
    // },
    dateFormatter(date) {
      return formatDate(date);
    },
    currencyFormatter(amount) {
      return formatCurrency(amount);
    },
    copySubscriptionCode(code) {
      copyToClipboard(code, () => {
        this.$snackbar.success("Successfully copied the subscription code");
      });
    },
    async refreshFetchSubscription() {
      this.isLoadingGetSubscription = true;
      try {
        const user = electronStore.get("account-subscription");
        const { email, password } = user;
        if (!email || !password) {
          localStorage.removeItem("user_info");
          electronStore.clearAll();
          setTimeout(() => {
            this.$router.replace("/login");
          }, 500);
        } else {
          const response = await this.$axios.post(
            `${this.$config.apiBaseUrl}/users/authenticate`,
            { email, password }
          );
          if (response.status == 200) {
            const accountSubscription =
              electronStore.get("account-subscription") || {};
            electronStore.set("account-subscription", {
              ...accountSubscription,
              email,
              password,
            });
            await this.fetchUserSubscription();
          }
        }
      } catch (error) {
        console.log("eror", error);
        this.$snackbar.error("Failed to retrieve subscription information");
      }
      this.isLoadingGetSubscription = false;
    },
    async fetchUserSubscription() {
      try {
        const resData = await window.electron.ipcRenderer.invoke(
          "get-subscription-info"
        );
        console.log("Fetch User Subscription ", resData);
        if (resData) {
          this.$store.commit("subscription/setSubscriptionInfo", resData.data);
          setTimeout(() => {
            this.$router.go();
          }, 1000);
        }
      } catch (error) {
        console.error("Error getting subscription info:", error);
      }
    },
  },
};
</script>

<template>
  <Card>
    <div class="flex justify-between flex-wrap gap-1">
      <h3 class="text-xl text-dark2 font-bold">Profile Data</h3>

      <Button
        theme="blue-outline"
        class="!text-xs !font-bold"
        @click="$router.push('/home/change-password')"
      >
        Change Password
      </Button>
    </div>

    <Card theme="primary" class="mt-3 w-full space-y-2 px-5 py-4">
      <div
        v-for="(item, idx) in dataProfile"
        :key="idx"
        class="flex items-center gap-2"
      >
        <Icon :name="item.icon" class="text-primary" />
        <span
          class="text-dark2 text-base"
          :class="idx ? 'font-medium' : 'font-bold'"
          >{{ item.value }}</span
        >
      </div>
    </Card>

    <h3 class="text-xl text-dark2 font-bold mt-8">Subscriptions Data</h3>
    <Card
      v-if="!subscriptions || subscriptions.length == 0"
      theme="secondary"
      class="flex flex-col items-center justify-center mt-3 w-full p-6"
    >
      <img src="~/assets/icons/empty.svg" alt="empty" />
      <div class="flex items-center gap-1 mt-3">
        <Icon
          name="refresh"
          :size="24"
          class="cursor-pointer"
          :class="{ 'animate-spin': isLoadingGetSubscription }"
          @clickIcon="refreshFetchSubscription"
        />
        <p class="text-sm text-dark2">Oops! You haven't subscribed yet</p>
      </div>
      <a href="#" class="text-secondary underline text-sm font-medium mt-5"
        >Subscribe Now</a
      >
    </Card>

    <template v-else v-for="(subscription, idx) in subscriptions">
      <Card
        :key="idx"
        :theme="subscription.status === 'active' ? 'secondary' : 'primary'"
        class="mt-3 w-full overflow-hidden"
      >
        <div class="flex items-center justify-between px-5 py-4">
          <button
            @click="copySubscriptionCode(subscription.code)"
            :class="
              subscription.status === 'active'
                ? 'text-secondary'
                : 'text-primary'
            "
            class="font-bold text-[18px]"
          >
            {{ subscription.code }}
          </button>

          <div
            class="capitalize px-[22px] py-1 bg-opacity-10 border border-opacity-20 text-xs font-bold rounded-[4px]"
            :class="{
              'bg-secondary border-secondary text-secondary':
                subscription.status === 'active',
              'bg-primary border-primary text-primary':
                subscription.status === 'register',
              'bg-red-500 border-red-500 text-red-500':
                subscription.status === 'inactive',
            }"
          >
            {{ subscription.status }}
          </div>
        </div>

        <div class="p-5 bg-white">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <Icon
                  name="product"
                  :class="
                    subscription.status === 'active'
                      ? 'text-secondary'
                      : 'text-primary'
                  "
                />
                <p class="font-bold">
                  {{ subscription.subscriptionPlan?.description }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <Icon
                  name="price-tag"
                  :class="
                    subscription.status === 'active'
                      ? 'text-secondary'
                      : 'text-primary'
                  "
                />
                <p class="font-medium">
                  {{ currencyFormatter(subscription.subscriptionPlan?.price) }}
                </p>
              </div>
            </div>
          </div>

          <hr class="border-[#FFF0E8] my-3" />

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Icon
                name="date"
                :class="
                  subscription.status === 'active'
                    ? 'text-secondary'
                    : 'text-primary'
                "
              />
              <p>Period: {{ subscription.cycle }}</p>
            </div>
            <p class="ml-7">
              Start date: {{ dateFormatter(subscription.startAt) }}
            </p>
            <p class="ml-7">
              End date: {{ dateFormatter(subscription.expiredAt) }}
            </p>
          </div>
        </div>
      </Card>
    </template>

    <footer
      class="flex justify-between items-center p-5 -m-5 mt-8 bg-primary/5"
    >
      <h6 class="text-sm font-bold">Contact us:</h6>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1 text-primary">
          <Icon name="phone" :size="16" />
          <a :href="`https://wa.me/${whatsapp}`" target="_blank">
            +{{ whatsapp }}
          </a>
        </div>

        <div class="flex items-center gap-1 text-primary">
          <Icon name="site" :size="16" />
          <a :href="`https://${website}`" target="_blank">
            {{
              $config.appName === "tiksender"
                ? $config.tiksenderWebsite
                : $config.supportsellerWebsite
            }}
          </a>
        </div>
      </div>
    </footer>
  </Card>
</template>
