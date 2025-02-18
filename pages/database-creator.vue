<script>
import {
  TIKTOK_CREATOR_PER_PAGE_OPTIONS,
  TIKTOK_CATEGORY_OPTIONS,
  TIKTOK_CREATOR_FOLLOWER_COUNT_OPTIONS,
} from "~/constants/option.constant";
import {
  convertToCompactFormat,
  convertToFixedNumber,
  convertToWhatsappNumber,
} from "~/utils/format-number";

export default {
  data() {
    return {
      isLoading: false,
      rows: [],
      headers: [
        { key: "userName", label: "User Name", width: 120 },
        { key: "email", label: "Email", width: 180 },
        { key: "whatsapp", label: "WhatsApp", width: 150 },
        { key: "followerCount", label: "Followers", width: 100 },
        { key: "creatorScore", label: "Score", width: 100 },
        { key: "productCount", label: "Products", width: 100 },
        { key: "categories", label: "Categories", width: 200 },
        { key: "action", label: "Action", width: 130 },
      ],
      pagination: {
        currentPage: 1,
        perPage: 10,
        totalResults: 0,
        totalPages: 0,
      },
      filterCategory: null,
      categoryOptions: TIKTOK_CATEGORY_OPTIONS,
      filterFollowerCount: null,
      followerCountOptions: TIKTOK_CREATOR_FOLLOWER_COUNT_OPTIONS,
      creatorPerPageOptions: TIKTOK_CREATOR_PER_PAGE_OPTIONS,
      search: null,
      tableMenuOptions: [
        { label: "Add to Wishlist", action: this.addWishList },
        {
          label: "Send Bulk WhatsApp",
          action: () => {
            this.openActionModal({
              modalType: "whatsapp-blast",
              templateType: "whatsapp",
            });
          },
        },
      ],
      modalState: {
        show: false,
        modalType: "email",
        templateType: "email",
        payload: null,
      },
      isShowModalWhatsappBlast: false,
      messageTemplate: "",
      messageList: [],
      showModalSubs: false,
    };
  },
  computed: {
    userInfo() {
      return this.$store.getters["user/getUserInfo"];
    },
    selectedItems() {
      return this.rows.filter((row) => !!row.selected && !row.disabled);
    },
    getSubscription() {
      return this.$store.getters["subscription/getSubscriptionPremium"];
    },
    whatsapp() {
      return this.$config.appName === "tiksender"
        ? this.$config.tiksenderWhatsapp
        : this.$config.supportsellerWhatsapp;
    },
  },
  methods: {
    async getDatabaseCreator() {
      try {
        this.isLoading = true;

        const payload = {
          page: this.pagination.currentPage,
          limit: this.pagination.perPage,
          category: this.filterCategory === "Semua" ? "" : this.filterCategory,
          followerCount:
            this.filterFollowerCount === "Semua"
              ? ""
              : this.filterFollowerCount,
          search: this.search,
        };

        const resData = await window.electron.ipcRenderer.invoke(
          "get-creator-tiktok",
          payload
        );

        if (resData) {
          this.rows = resData.data.map((row) => ({
            ...row,
            selected: false,
            disabled: !row.whatsapp,
          }));
          this.pagination = {
            ...resData.pagination,
          };
        }
      } catch (error) {
        this.$snackbar.error("Failed to fetch creator data");
        console.error("Error getting database creators:", error);
      } finally {
        this.isLoading = false;
      }
    },
    changePage(pageNumber) {
      this.pagination.currentPage = pageNumber;
      this.getDatabaseCreator();
    },
    formatFollowerCount(followerCount) {
      return convertToCompactFormat(followerCount);
    },
    formatCreatorScore(creatorScore) {
      return convertToFixedNumber(creatorScore, 1);
    },
    onSearch() {
      this.pagination.currentPage = 1;
      this.getDatabaseCreator();
    },
    openTiktokAccount(userName) {
      if (userName) {
        window.open(`https://www.tiktok.com/@${userName}`, "_blank");
      }
    },
    openActionModal({ modalType, templateType, payload }) {
      this.modalState = {
        show: true,
        modalType,
        templateType,
        payload,
      };
    },
    gotoWhatsappAdmin() {
      window.open(`https://wa.me/${this.whatsapp}`, "_blank");
    },
    onConfirmWhatsappTemplate(messageTemplate) {
      if (!this.getSubscription) {
        this.showModalSubs = true;
        return;
      }

      this.messageTemplate = messageTemplate;
      this.messageList = this.selectedItems.map((item) => ({
        name: `@${item.userName}`,
        phoneNumber: convertToWhatsappNumber(item.whatsapp),
      }));

      setTimeout(() => {
        this.isShowModalWhatsappBlast = true;
      }, 1000);
    },
    async addWishList() {
      if (!this.getSubscription) {
        this.showModalSubs = true;
        return;
      }

      if (this.selectedItems.length) {
        const requests = this.selectedItems.map((item) =>
          window.electron.ipcRenderer.invoke("create-wishlist-creator", {
            subscriptionId: this.getSubscription.id,
            affiliatedProductCount: item.productCount,
            creatorScore: item.creatorScore,
            email: item.email,
            followerCount: item.followerCount,
            name: item.name,
            relatedCategories: item.categories?.split(", "),
            username: item.userName,
            whatsapp: item.whatsapp,
          })
        );

        Promise.all(requests)
          .then((res) => {
            if (res.every((r) => !r.error)) {
              this.$snackbar.success("Successfully added creator to wishlist");
            } else {
              this.$snackbar.error("Failed to add creator to wishlist");
              console.error("Error adding creator to wishlist: ", res);
            }
          })
          .catch((err) => {
            this.$snackbar.error(err.message);
          });
      }
    },
    async exportDataToExcel() {
      if (!this.getSubscription) {
        this.showModalSubs = true;
        return;
      }

      console.log("Exporting data to Excel...");
      const resData = await window.electron.ipcRenderer.invoke(
        "export-data-to-excel",
        {
          fileName: "database-creator",
          endpoint: "/tikblast-creators",
          params: {
            category:
              this.filterCategory === "Semua" ? "" : this.filterCategory,
            search: this.search,
          },
        }
      );
      window.alert(
        `Successfully created Excel file at:\n" ${resData.filePath} "`
      );
      console.log("Export data to Excel:", resData);
    },
  },
  mounted() {
    this.getDatabaseCreator();
  },
};
</script>

<template>
  <Card>
    <h1 class="text-xl font-semibold text-dark2">TikTok Creator Data</h1>

    <div class="flex items-center justify-between gap-2 mt-5">
      <div class="flex items-center gap-2">
        <Dropdown
          v-model="filterCategory"
          placeholder="Select category"
          :options="categoryOptions"
          @change="getDatabaseCreator"
        />
        <Dropdown
          v-model="filterFollowerCount"
          placeholder="Select follower count"
          :options="followerCountOptions"
          @change="getDatabaseCreator"
        />
      </div>
      <div class="flex items-center gap-2">
        <Dropdown
          v-model="pagination.perPage"
          :show-option-all="false"
          placeholder="Select number of creators"
          :options="creatorPerPageOptions"
          @change="getDatabaseCreator"
        />
        <Textfield
          v-model="search"
          placeholder="Search here..."
          icon="search"
          :icon-size="24"
          @change="onSearch"
        />
      </div>
    </div>

    <Table
      v-if="userInfo.subscriptionId"
      :rows.sync="rows"
      :headers="headers"
      :pagination="pagination"
      :loading="isLoading"
      show-row-number
      @change:page="changePage"
      selectable
      :menu-options="tableMenuOptions"
      class="-m-5 mt-10 rounded-b-[10px] overflow-auto"
    />

    <div
      v-else
      class="text-center font-medium mt-4 p-4 border border-secondary rounded-md"
    >
      You are not subscribed to Tiksender
    </div>

    <div class="flex justify-end pb-3 pt-10">
      <Button @click="exportDataToExcel()"> Export to Excel </Button>
    </div>
  </Card>
</template>
