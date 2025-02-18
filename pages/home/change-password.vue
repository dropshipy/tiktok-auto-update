<script>
export default {
  data() {
    return {
      currentPassword: "",
      isShowCurrentPassword: false,
      newPassword: "",
      isShowNewPassword: false,
      breadcrumbItems: [
        { name: "Home", link: "/home" },
        { name: "Change Password", link: "/home/change-password" },
      ],
    };
  },
  computed: {
    userInfo() {
      return this.$store.getters["user/getUserInfo"] || {};
    },
  },
  methods: {
    async onConfirm() {
      const { currentPassword, newPassword } = this;

      if (!currentPassword || !newPassword) {
        this.$snackbar.error("Form is incomplete");
      } else {
        const payload = {
          email: this.userInfo.email,
          password: currentPassword,
          newPassword,
        };
        const response = await this.$axios.patch(
          `${this.$config.apiBaseUrl}/users/password`,
          payload
        );

        if (response.status === 201) {
          const accountSubscription =
            electronStore.get("account-subscription") || {};
          electronStore.set("account-subscription", {
            ...accountSubscription,
            email: payload.email,
            password: payload.newPassword,
          });

          this.$snackbar.success("Password changed successfully");
          this.$router.push("/home");
        } else {
          this.$snackbar.error(response.data?.error || response.data?.message);
        }
      }
    },
  },
};
</script>

<template>
  <div class="w-full max-w-lg mx-auto">
    <Breadcrumbs :items="breadcrumbItems" />

    <Card class="mt-4">
      <h1 class="text-[26px] font-bold">Change Password</h1>
      <p class="text-dark3 mt-2">Please complete the following data.</p>

      <Textfield
        :value="userInfo.email"
        label="Email"
        placeholder="Enter your email here"
        readonly
        class="mt-7"
      />

      <Textfield
        v-model="currentPassword"
        label="Current password"
        placeholder="Enter the current password"
        class="mt-4"
        :type="isShowCurrentPassword ? 'text' : 'password'"
        @click:icon="isShowCurrentPassword = !isShowCurrentPassword"
        :icon="isShowCurrentPassword ? 'eye-show' : 'eye-hide'"
      />

      <Textfield
        v-model="newPassword"
        label="New password"
        placeholder="Enter the new password here"
        class="mt-4"
        :type="isShowNewPassword ? 'text' : 'password'"
        @click:icon="isShowNewPassword = !isShowNewPassword"
        :icon="isShowNewPassword ? 'eye-show' : 'eye-hide'"
      />

      <Button class="mt-11 w-full !text-base" @click="onConfirm">Save</Button>
    </Card>
  </div>
</template>
