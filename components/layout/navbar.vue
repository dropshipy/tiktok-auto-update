<script>
export default {
  data() {
    return {
      isOpenSettings: false,
      isShowTiktokAccountModal: false,
      isShowTiktokSelectCountryModal: false,
      isShowTiktokSelectAccountModal: false,
      isShowDeleteTiktokSessionModal: false,
      isShowBrowserOptionsModal: false,
    };
  },

  methods: {
    onClickMenuItem(type) {
      switch (type) {
        case "tiktok-account":
          this.isShowTiktokAccountModal = true;
          break;
        case "tiktok-select-country":
          this.isShowTiktokSelectCountryModal = true;
          break;
        case "tiktok-select-account":
          this.isShowTiktokSelectAccountModal = true;
          break;
        case "delete-tiktok-session":
          this.isShowDeleteTiktokSessionModal = true;
          break;
        case "browser-options":
          this.isShowBrowserOptionsModal = true;
          break;
      }
    },
    async logout() {
      await window.whatsappAPI.logout();
      localStorage.removeItem("user_info");
      electronStore.clearAll();
      setTimeout(() => {
        this.$router.replace("/login");
      }, 500);
    },
  },

  computed: {
    isSupportSeller() {
      return this.$config.appName === "supportseller";
    },
  },
};
</script>

<template>
  <nav
    class="sticky h-[72px] top-0 shadow-navbar flex items-center justify-between px-8 py-4 z-10"
    :class="[isSupportSeller ? 'bg-[#97E9EE]' : 'bg-white']"
  >
    <div class="flex items-center gap-1">
      <template v-if="isSupportSeller">
        <img src="/icons/tikblast.svg" alt="tikblast" />
        <h3 class="font-bold text-xl text-black">Tikblast</h3>
      </template>
    </div>

    <div class="flex items-center">
      <Button
        theme="tertiary"
        class="relative"
        @click.stop="isOpenSettings = !isOpenSettings"
      >
        <Icon name="setting" :class="{ '!text-[#FE2B54]': isSupportSeller }" />
        <span :class="{ '!text-[#FE2B54]': isSupportSeller }">Settings</span>

        <Menu v-model="isOpenSettings">
          <MenuItem @click="onClickMenuItem('tiktok-account')">
            <Icon name="tiktok" class="text-primary" />
            <p class="text-sm whitespace-nowrap leading-normal">
              Tiktok Account
            </p>
          </MenuItem>
          <MenuItem @click="onClickMenuItem('tiktok-select-country')">
            <Icon name="flag" class="text-primary" />
            <p class="text-sm whitespace-nowrap leading-normal">
              Select Country
            </p>
          </MenuItem>
          <MenuItem @click="onClickMenuItem('tiktok-select-account')">
            <Icon name="person-gear" class="text-primary" />
            <p class="text-sm whitespace-nowrap leading-normal">
              Select Account
            </p>
          </MenuItem>

          <MenuItem @click="onClickMenuItem('delete-tiktok-session')">
            <Icon name="delete" class="text-primary" />
            <p class="text-sm whitespace-nowrap leading-normal">
              Delete TikTok Login Session
            </p>
          </MenuItem>
          <MenuItem @click="onClickMenuItem('browser-options')">
            <Icon name="setting" class="text-primary" />
            <p class="text-sm whitespace-nowrap leading-normal">
              Browser Options
            </p>
          </MenuItem>
        </Menu>
      </Button>

      <Button
        class="ml-4"
        @click="logout"
        :class="{ 'text-white !bg-[#FE2B54]': isSupportSeller }"
      >
        <span>Logout</span>
        <Icon name="logout" />
      </Button>

      <AppSettingsTiktokAccountModal v-model="isShowTiktokAccountModal" />
      <AppSettingsTiktokSelectCountry
        v-model="isShowTiktokSelectCountryModal"
      />
      <AppSettingsTiktokSelectAccount
        v-model="isShowTiktokSelectAccountModal"
      />

      <AppSettingsDeleteTiktokSessionModal
        v-model="isShowDeleteTiktokSessionModal"
      />
      <AppSettingsChromeModal v-model="isShowBrowserOptionsModal" />
    </div>
  </nav>
</template>
