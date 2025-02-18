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
        { key: "username", label: "User Name", width: 120 },
        { key: "email", label: "Email", width: 180 },
        { key: "whatsapp", label: "WhatsApp", width: 150 },
        { key: "followerCount", label: "Follower", width: 100 },
        { key: "creatorScore", label: "Skor", width: 100 },
        { key: "affiliatedProductCount", label: "Produk", width: 100 },
        { key: "categories", label: "Kategori", width: 200 },
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
      isShowModalDeleteWishList: false,
      isShowModalWhatsappTemplate: false,
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
    isPremium() {
      return this.$store.getters["subscription/getHasPremiumPlan"];
    },
    whatsapp() {
      return this.$config.appName === "tiksender"
        ? this.$config.tiksenderWhatsapp
        : this.$config.supportsellerWhatsapp;
    },
    sendTextBtn() {
      return this.selectedItems.length === 0
        ? "Send All WA at once"
        : "Send WA at once";
    },
    whatsappSendList() {
      if (this.selectedItems.length === 0) {
        return this.messageList;
      }
      const items = this.selectedItems.map((item) => ({
        name: `@${item.username}`,
        phoneNumber: convertToWhatsappNumber(item.whatsapp),
      }));
      return items;
    },
  },
  methods: {
    async getWishlistCreators() {
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
          subscriptionId: this.userInfo.subscriptionId,
        };

        const resData = await window.electron.ipcRenderer.invoke(
          "get-wishlist-creators",
          payload
        );
        if (resData) {
          this.rows = resData.data.map((row) => ({
            ...row,
            categories: row.relatedCategories.join(", "),
            selected: false,
            disabled: !row.whatsapp,
          }));

          this.pagination = {
            ...resData.pagination,
          };
        }
      } catch (error) {
        this.$snackbar.error("Gagal mengambil data wishlist creator");
        console.error("Error getting database wishlist creators:", error);
      } finally {
        this.isLoading = false;
      }
    },
    async getMessageReceiverList() {
      let currentPage = 1;
      let totalPages = 0;
      const list = [];

      do {
        try {
          const resData = await window.electron.ipcRenderer.invoke(
            "get-wishlist-creators",
            {
              page: currentPage,
              subscriptionId: this.userInfo.subscriptionId,
            }
          );

          if (resData?.data) {
            const items = resData.data.map((item) => ({
              name: `@${item.username}`,
              phoneNumber: convertToWhatsappNumber(item.whatsapp),
            }));
            list.push(items);
          }
          totalPages = resData.pagination?.totalPages;
          currentPage++;
        } catch (error) {
          console.error("Error getting message receiver list: ", error);
          break;
        }
      } while (currentPage <= totalPages);

      this.messageList = list;
    },
    changePage(pageNumber) {
      this.pagination.currentPage = pageNumber;
      this.getWishlistCreators();
    },
    convertToCompactFormat,
    convertToFixedNumber,
    sendWhatsapp(phoneNumber) {
      if (phoneNumber) {
        window.open(
          `https://api.whatsapp.com/send?phone=${convertToWhatsappNumber(
            phoneNumber
          )}&text=`,
          "_blank"
        );
      } else if (!this.isPremium) {
        this.showModalSubs = true;
        return;
      }
    },
    sendEmail(emailAddress) {
      if (!this.isPremium) {
        this.showModalSubs = true;
        return;
      } else if (emailAddress) {
        window.open(
          `mailto:${emailAddress}?subject=Undangan Afiliasi Tiktok&body=`,
          "_blank"
        );
      }
    },
    onSearch() {
      this.pagination.currentPage = 1;
      this.getWishlistCreators();
    },
    openTiktokAccount(userName) {
      if (userName) {
        window.open(`https://www.tiktok.com/@${userName}`, "_blank");
      }
    },
    async onConfirmWhatsappTemplate(messageTemplate) {
      if (!this.isPremium) {
        this.showModalSubs = true;
        return;
      }
      this.messageTemplate = messageTemplate;
      if (this.selectedItems.length === 0) {
        await this.getMessageReceiverList();
      }

      setTimeout(() => {
        this.isShowModalWhatsappBlast = true;
      }, 1000);
    },
    async deleteWishList() {
      if (this.selectedItems.length) {
        const requests = this.selectedItems.map((item) => {
          return window.electron.ipcRenderer.invoke(
            "delete-wishlist-creator",
            item.id
          );
        });

        Promise.all(requests)
          .then((res) => {
            if (res.every((r) => !r.error)) {
              this.$snackbar.success("Berhasil menghapus creator ke wishlist");
              this.isShowModalDeleteWishList = false;
              this.getWishlistCreators();
            } else {
              this.$snackbar.error("Gagal menghapus creator ke wishlist");
              console.error("Error deleting creator to wishlist: ", res);
            }
          })
          .catch((err) => {
            this.$snackbar.error(err.message);
          });
      }
    },
    gotoWhatsappAdmin() {
      window.open(`https://wa.me/${this.whatsapp}`, "_blank");
    },
  },
  mounted() {
    this.getWishlistCreators();
  },
};
</script>

<template>
  <Card>
    <h1 class="text-xl font-semibold text-dark2">Wishlist</h1>

    <div class="flex items-center justify-between flex-wrap gap-2 mt-5">
      <div class="flex items-center flex-wrap gap-2">
        <Dropdown
          v-model="filterCategory"
          placeholder="Select a category"
          :options="categoryOptions"
          @change="getWishlistCreators"
          class="flex-grow"
        />
        <Dropdown
          v-model="filterFollowerCount"
          placeholder="Select the number of followers"
          :options="followerCountOptions"
          @change="getWishlistCreators"
          class="flex-grow"
        />

        <div class="flex items-center gap-2 flex-grow">
          <Button
            theme="primary-outline"
            class="h-11 !p-2 flex-grow"
            @click="isShowModalWhatsappTemplate = true"
          >
            <Icon name="whatsapp" />
            <span> {{ sendTextBtn }}</span>
          </Button>

          <Button
            theme="tertiary"
            class="h-11 !p-2"
            :disabled="selectedItems.length === 0"
            @click="isShowModalDeleteWishList = true"
          >
            <Icon name="delete" />
          </Button>
        </div>
      </div>

      <Textfield
        v-model="search"
        placeholder="Search here..."
        icon="search"
        :icon-size="24"
        @change="onSearch"
        class="flex-grow md:flex-grow-0"
      />
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
      class="-m-5 mt-10 rounded-b-[10px] overflow-auto"
    >
      <template #col.whatsapp="{ row }">
        <Tooltip
          v-if="row.whatsappAlreadySent"
          text="You have already sent to this Whatsapp number."
          class="flex items-center gap-2 text-green2"
        >
          <span>{{ row.whatsapp }}</span>
          <Icon name="info-outline" :size="16" />
        </Tooltip>

        <span>{{ row.whatsapp }}</span>
      </template>

      <template #col.followerCount="{ row }">
        <div class="flex items-center gap-1">
          <Icon name="people" :size="18" class="text-primary" />
          <span>
            {{ convertToCompactFormat(row.followerCount || 0) }}
          </span>
        </div>
      </template>

      <template #col.creatorScore="{ row }">
        <div class="flex items-center gap-1">
          <Icon
            name="star"
            :size="16"
            viewBox="0 0 14 13"
            class="text-yellow"
          />
          <span>
            {{ convertToFixedNumber(row.creatorScore || 0) }}
          </span>
        </div>
      </template>

      <template #col.action="{ row }">
        <div class="flex items-center gap-1">
          <button
            @click="openTiktokAccount(row.userName)"
            :class="
              row.userName
                ? 'text-primary cursor-pointer'
                : 'text-gray-400 pointer-events-none'
            "
          >
            <Icon name="tiktok" />
          </button>

          <div class="w-[0.5px] h-5 bg-secondary/10"></div>

          <button
            @click="sendWhatsapp(row.whatsapp)"
            :class="
              row.whatsapp
                ? 'text-primary cursor-pointer'
                : 'text-gray-400 pointer-events-none'
            "
          >
            <Icon name="whatsapp" />
          </button>

          <div class="w-[0.5px] h-5 bg-secondary/10"></div>

          <button
            @click="sendEmail(row.email)"
            :class="
              row.email
                ? 'text-primary cursor-pointer'
                : 'text-gray-400 pointer-events-none'
            "
          >
            <Icon name="email" :size="22" />
          </button>
        </div>
      </template>
    </Table>

    <div
      v-else
      class="text-center font-medium mt-4 p-4 border border-secondary rounded-md"
    >
      You haven't subscribed to Tiksender yet
    </div>

    <Modal
      v-model="isShowModalDeleteWishList"
      title="Hapus Wishlist"
      confirm-btn-text="Ya, Hapus"
      @confirm="deleteWishList"
    >
      <p class="mb-8">
        Are you sure you want to remove the item from your wishlist?
      </p>
    </Modal>

    <AppTemplateModal
      v-model="isShowModalWhatsappTemplate"
      modal-type="whatsapp-blast"
      template-type="whatsapp"
      @confirm="onConfirmWhatsappTemplate"
    />
    <AppWhatsappModal
      v-model="isShowModalWhatsappBlast"
      :list="whatsappSendList"
      :message="messageTemplate"
    />

    <Modal
      v-model="showModalSubs"
      title="You haven't subscribed yet. Contact admin on WhatsApp?"
      @confirm="gotoWhatsappAdmin"
      confirm-btn-text="Iya"
    >
    </Modal>
  </Card>
</template>
