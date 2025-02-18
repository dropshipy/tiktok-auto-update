<script>
import {
  TIKTOK_CATEGORY_OPTIONS,
  TIKTOK_SUBCATEGORY_OPTIONS,
  TIKTOK_SCORE_CREATOR_OPTIONS,
  TIKTOK_FOLLOWER_COUNT_OPTIONS,
  TIKTOK_FOLLOWER_AGE_OPTIONS,
  TIKTOK_FOLLOWER_GENDER_OPTIONS,
  TIKTOK_FILTER_CREATOR_V2_OPTIONS,
} from "~/constants/option.constant";
import { TIKTOK_ACCOUNT_STORE_KEY } from "~/constants/store.constant";
// import { mapActions } from "vuex";

export default {
  data() {
    return {
      config: null,
      loginMethod: "seller_email",
      iteration: 1,
      startPoint: 1,
      mainCategory: "Semua",
      subCategories: [],
      isAllSubCategoriesSelected: false,
      creatorScore: null,
      isAgencyManaged: false,
      followerCount: null,
      followerAge: null,
      followerGender: null,
      invitationMessage: null,
      isShowModalListCreator: false,
      listInvitedCreator: [],
      isRefresh: false,
      showCategoryId: "",
      showCategoryIdTemp: "",
      selectedCategory: [],
      TIKTOK_CATEGORY_OPTIONS,
      TIKTOK_SUBCATEGORY_OPTIONS,
      TIKTOK_SCORE_CREATOR_OPTIONS,
      TIKTOK_FOLLOWER_COUNT_OPTIONS,
      TIKTOK_FOLLOWER_AGE_OPTIONS,
      TIKTOK_FOLLOWER_GENDER_OPTIONS,
      TIKTOK_FILTER_CREATOR_V2_OPTIONS,
      isSaveToCreatorManagement: true,
      isCollectingData: false,
      showModalSubs: false,
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
    // ...mapActions({
    //   setSelectedSubscription: "subscription/setSelectedSubscription",
    // }),
    async getUserTikblastConfig() {
      try {
        const getConfig = electronStore.get("filterCreatorConfig");
        if (getConfig) {
          const {
            selectedCategory,
            followerCount,
            followerAge,
            followerGender,
            iteration,
            invitationMessage,
            isSaveToCreatorManagement,
          } = getConfig;

          this.selectedCategory = selectedCategory;
          this.followerCount = followerCount;
          this.followerAge = followerAge;
          this.followerGender = followerGender;
          this.invitationMessage = invitationMessage;
          this.iteration = iteration;
          this.isSaveToCreatorManagement = isSaveToCreatorManagement ?? true;
        }
      } catch (error) {
        this.$snackbar.error("Failed to retrieve tikblast configuration");
        console.error("Error getting tikblast config: ", error);
      }
    },

    async onSave() {
      if (!this.iteration || !this.startPoint || !this.invitationMessage) {
        this.$snackbar.error("Failed to save. Double check the configuration.");
        return;
      }
      try {
        const payload = {
          selectedCategory: this.selectedCategory,
          followerCount: this.followerCount,
          followerAge: this.followerAge,
          followerGender: this.followerGender,
          invitationMessage: this.invitationMessage,
          iteration: this.iteration,
          isSaveToCreatorManagement: this.isSaveToCreatorManagement,
        };
        electronStore.set("filterCreatorConfig", payload);
        this.$snackbar.success("Successfully saved configuration");
      } catch (error) {
        this.$snackbar.error("Failed to save configuration");
        console.error("Error saving config: ", error);
      }
    },
    gotoWhatsappAdmin() {
      window.open(`https://wa.me/${this.whatsapp}`, "_blank");
    },
    async onStart() {
      // this.isShowModalListCreator = true;

      const getSubscription = await this.$store.dispatch(
        "subscription/setSelectedSubscription",
        "premium"
      );
      if (!getSubscription) {
        this.showModalSubs = true;
        return;
      }

      const {
        iteration,
        invitationMessage,
        isSaveToCreatorManagement,
        isCollectingData,
      } = this;
      if (!iteration || !invitationMessage) {
        this.$snackbar.error(
          "The automation bot configuration must be filled in"
        );
        return;
      }

      const filterParams = this.changeFollowerFilterFormat();
      const config = {
        subscriptionId: getSubscription.id,
        filterParams,
        iteration,
        invitationMessage,
        isSaveToCreatorManagement,
        isCollectingData,
      };
      console.log("config", config);

      const tiktokAccount = electronStore.get(TIKTOK_ACCOUNT_STORE_KEY);
      if (tiktokAccount?.email && tiktokAccount?.password) {
        const result = await window.electron.ipcRenderer.invoke(
          "chat-and-save-creators",
          config
        );
        this.listInvitedCreator = result;
      } else {
        this.$snackbar.error("Please fill in your TikTok account data");
        this.$nuxt.$emit("show-tiktok-account-modal");
      }
    },
    onChangeCategory(val) {
      if (this.mainCategory === val.mainCategory) {
        this.subCategories = val.subCategories;
      } else {
        const newSubCategories = this.getSubCategoriesByMainCategory(
          val.mainCategory
        ).filter((item) => {
          return val.subCategories.includes(item);
        });
        this.mainCategory = val.mainCategory;
        this.subCategories = newSubCategories;
      }
    },
    onChangeCategoryAll() {
      this.mainCategory = "Semua";
      this.subCategories = [];
    },
    onAllOptionSelected({ mainCategory, isAllSelected }) {
      if (mainCategory === this.mainCategory) {
        this.isAllSubCategoriesSelected = isAllSelected;
      }
    },
    getSubCategoriesByMainCategory(mainCategory) {
      return (TIKTOK_SUBCATEGORY_OPTIONS[mainCategory] || []).map(
        (item) => item.value
      );
    },
    refreshListInvitedCreator() {
      this.isRefresh = !this.isRefresh;
      const data = electronStore.get("invitedCreator");
      if (data) {
        this.listInvitedCreator = data;
      }
    },
    deleteListInvitedCreator() {
      electronStore.delete("invitedCreator");
      this.$snackbar.success("Berhasil menghapus list");
    },
    onSelectCategory(ids, isAll) {
      if (isAll) {
        const parentId = ids.id.toString();
        let hasId1 = this.selectedCategory.some((obj) =>
          obj.string_list.includes(parentId)
        );

        if (!hasId1) {
          const allCategorySelected = ids.option_children.map((opt) => {
            return { string_list: [parentId, opt.id.toString()] };
          });

          this.selectedCategory = [
            ...this.selectedCategory,
            ...allCategorySelected,
          ];
        } else {
          let filteredArray = this.selectedCategory.filter(
            (obj) => !obj.string_list.includes(parentId)
          );
          this.selectedCategory.length = 0;
          Array.prototype.push.apply(this.selectedCategory, filteredArray);
        }
        this.showCategoryId = "";
        this.showCategoryIdTemp = "";
      } else {
        let existingIndex = this.selectedCategory.findIndex(
          (obj) =>
            obj.string_list.includes(ids[0]) && obj.string_list.includes(ids[1])
        );
        if (existingIndex === -1) {
          this.selectedCategory.push({ string_list: ids });
        } else {
          this.selectedCategory.splice(existingIndex, 1);
        }
      }
    },
    showCategoryField(id) {
      if (this.showCategoryId == id) {
        this.showCategoryId = "";
      } else this.showCategoryId = id;
    },
    isSelectedCategory(id) {
      for (let obj of this.selectedCategory) {
        if (obj.string_list.includes(id)) {
          return true;
        }
      }
      return false;
    },
    totalSelectedCategories(categoryId) {
      let count = 0;

      for (let obj of this.selectedCategory) {
        for (let id of obj.string_list) {
          if (id === categoryId) {
            count++;
          }
        }
      }
      return count;
    },
    changeFilterFormat() {
      if (condition) {
      }
    },
    changeFollowerFilterFormat() {
      let config = {};
      const { selectedCategory, followerCount, followerAge, followerGender } =
        this;
      if (followerCount && followerCount !== "Semua") {
        const getVal = followerCount.split("-");
        const result = {
          follower_filter: {
            left_bound: parseFloat(getVal[0].trim()),
            right_bound: getVal[1].trim() ? parseFloat(getVal[1].trim()) : -1,
          },
        };
        Object.assign(config, result);
      }
      if (selectedCategory.length > 0) {
        const result = {
          category_list: selectedCategory,
        };
        Object.assign(config, result);
      }
      if (followerAge && followerAge !== "Semua") {
        const result = { follower_age_groups: [followerAge] };
        Object.assign(config, result);
      }
      if (followerGender && followerGender !== "Semua") {
        const result = {
          gender_filter: { gender: followerGender, percentage: 5000 },
        };
        Object.assign(config, result);
      }
      return config;
    },
  },
  mounted() {
    if (this.userInfo?.subscriptionId) {
      this.getUserTikblastConfig();
    }
  },
};
</script>

<template>
  <Card>
    <h1 class="text-xl font-semibold text-dark2">Configure Invite Creators</h1>

    <div v-if="userInfo?.subscriptionId">
      <h2 class="text-base font-medium text-dark3 !mt-5">Filter Creator</h2>
      <div class="flex flex-wrap gap-5 p-1">
        <section
          v-for="(item, id) in TIKTOK_FILTER_CREATOR_V2_OPTIONS"
          :key="id"
          class="relative"
          @mouseleave="showCategoryIdTemp = ''"
          @mouseenter="showCategoryIdTemp = item.id"
          @click="showCategoryField(item.id)"
        >
          <div
            class="cursor-pointer border rounded-lg text-dark3 xl:h-[50px] flex justify-center items-center w-[130px]"
            :class="
              isSelectedCategory(item.id)
                ? 'text-primary border-primary bg-primary/10'
                : 'text-dark2'
            "
          >
            <div class="text-xs font-medium p-3 truncate flex">
              <p class="text-center truncate">
                {{ item.name }}
              </p>
              <p :class="{ hidden: totalSelectedCategories(item.id) == 0 }">
                ({{ totalSelectedCategories(item.id) }})
              </p>
              <!-- Dropdown -->
              <div
                v-if="
                  showCategoryId == item.id || showCategoryIdTemp == item.id
                "
                @mouseleave="showCategoryId = ''"
                class="absolute top-[100%] left-0 right-0 w-max shadow z-40 max-h-[150px] overflow-y-scroll space-y-2 bg-white rounded-lg py-3"
              >
                <p
                  class="text-sm font-medium px-3 text-dark2 hover:opacity-60 border-b pb-2"
                  @click="onSelectCategory(item, true)"
                >
                  <span>{{
                    totalSelectedCategories(item.id) == 0
                      ? "Select All"
                      : "Remove All"
                  }}</span>
                </p>

                <section v-for="(opt, id) in item.option_children" :key="id">
                  <div @click="onSelectCategory([item.id, opt.id])">
                    <p
                      class="text-sm font-medium px-3 hover:opacity-60"
                      :class="
                        isSelectedCategory(opt.id)
                          ? 'text-primary'
                          : 'text-dark2'
                      "
                    >
                      {{ opt.name }}
                    </p>
                  </div>
                </section>
              </div>
            </div>

            <!-- end Dropdown -->
          </div>
        </section>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-5">
        <div class="space-y-3">
          <h2 class="text-base font-medium text-dark3">
            Creator Follower Profile
          </h2>
          <Dropdown
            v-model="followerCount"
            :options="TIKTOK_FOLLOWER_COUNT_OPTIONS"
            label="Followers"
            placeholder="Select followers"
          />
          <Dropdown
            v-model="followerAge"
            :options="TIKTOK_FOLLOWER_AGE_OPTIONS"
            label="Followers Age"
            placeholder="Select age followers"
          />
          <Dropdown
            v-model="followerGender"
            :options="TIKTOK_FOLLOWER_GENDER_OPTIONS"
            label="Followers Gender"
            placeholder="Select gender gollowers"
          />
          <!-- <Textfield
            v-model="startPoint"
            label="Mulai automasi dari urutan kreator ke"
            placeholder="Masukkan mulai dari urutan kreator ke"
            type="number"
          /> -->

          <!-- <div class="dropdown-category-group flex flex-wrap gap-x-3">
            <DropdownCategory
              v-model="mainCategory"
              label="Semua"
              @change="onChangeCategoryAll"
            />
            <DropdownCategory
              v-model="mainCategory"
              v-for="(category, idx) in TIKTOK_CATEGORY_OPTIONS"
              :key="idx"
              :label="category.label"
              :items="TIKTOK_SUBCATEGORY_OPTIONS[category.value]"
              :selected-items="subCategories"
              @change="onChangeCategory"
              @Semua-option-selected="onAllOptionSelected"
            />
          </div> -->

          <!-- <h2 class="text-base font-medium text-dark3 !mt-5">
            Atribut Kreator
          </h2>
          <Dropdown
            v-model="creatorScore"
            :options="TIKTOK_SCORE_CREATOR_OPTIONS"
            label="Skor Kreator"
            placeholder="Pilih skor kreator"
          />

          <div class="flex flex-col">
            <label class="text-dark3">Dikelola oleh agensi?</label>
            <div class="flex items-center gap-2 mt-3">
              <input
                v-model="isAgencyManaged"
                type="checkbox"
                id="checkbox-agency"
                class="accent-primary w-4 h-4"
              />
              <label for="checkbox-agency">Ya</label>
            </div>
          </div> -->
        </div>
        <div class="space-y-3">
          <h2 class="text-base font-medium text-dark3">
            Automation Bot Configuration
          </h2>
          <Textfield
            v-model="iteration"
            label="Number Of Creator"
            placeholder="Enter the number of creator"
            type="number"
          />

          <Textfield
            v-model="invitationMessage"
            label="Message invitations to affiliates"
            type="textarea"
            input-class="min-h-24"
            placeholder="Enter messages"
            :max-height="400"
          >
            <template #label>
              <div class="flex items-center space-x-1 text-error ml-auto">
                <Icon name="warning" :size="14" />
                <span>Must be filled</span>
              </div>
            </template>
          </Textfield>

          <Toggle
            v-model="isSaveToCreatorManagement"
            label="Save creators to 'Manage Creators'"
          />
        </div>
      </div>

      <div class="flex items-center justify-end mt-10 gap-2.5">
        <Button
          class="w-full max-w-[150px] text-nowrap"
          theme="primary-outline"
          @click="isShowModalListCreator = !isShowModalListCreator"
          >Invited Creators</Button
        >

        <Button
          class="w-full max-w-[140px]"
          theme="primary-outline"
          @click="onSave"
          >Save</Button
        >
        <Button class="w-full max-w-[140px]" @click="onStart">Start</Button>
      </div>

      <div class="flex justify-end mt-8" v-if="userInfo.role === 'admin'">
        <Toggle v-model="isCollectingData" label="Collecting Data Creator" />
      </div>
    </div>

    <div
      v-else-if="userInfo && !userInfo.subscriptionId"
      class="text-center font-medium mt-4 p-4 border border-secondary rounded-md"
    >
      You don't have an active subscription
    </div>

    <div v-else class="text-center mt-4 p-4 border border-secondary rounded-md">
      <p class="font-medium">You haven't subscribed yet</p>
      <p class="mt-2 text-sm">*Contact admin to start subscribing</p>
    </div>
    <LiveReportListSaveAndChatCreator v-model="isShowModalListCreator">
      <template>
        <header class="flex items-center justify-between">
          <div
            class="flex items-center gap-2 cursor-pointer"
            @click="refreshListInvitedCreator"
          >
            <img
              src="/icons/refresh.svg"
              alt="refresh"
              class="w-5 h-5 transition-Semua ease-in-out duration-300"
              :class="[isRefresh ? 'rotate-180' : '']"
            />
            <p>Refresh</p>
          </div>
          <img
            src="/icons/trash.svg"
            alt="delete"
            class="w-5 h-5 cursor-pointer"
            @click="deleteListInvitedCreator"
          />
        </header>

        <template v-if="listInvitedCreator && listInvitedCreator.length > 0">
          <div class="mt-5 h-[300px] overflow-scroll">
            <div
              v-for="(creator, id) in listInvitedCreator"
              :key="id"
              class="space-y-3"
            >
              <p class="text-sm">
                Successfully sent message to sequence creator
                {{ creator.index }} :
                <span class="font-semibold">
                  {{ creator.name }}
                </span>
              </p>
            </div>
          </div>
        </template>
      </template>
    </LiveReportListSaveAndChatCreator>

    <Modal
      v-model="showModalSubs"
      title="You haven't subscribed yet. Contact admin on WhatsApp?"
      @confirm="gotoWhatsappAdmin"
      confirm-btn-text="Yes"
    >
    </Modal>
  </Card>
</template>
