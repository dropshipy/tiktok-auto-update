<script>
import { TIKTOK_SELECTED_SORT_OPTIONS } from "~/constants/option.constant";
import {
  convertToWhatsappNumber
} from '~/utils/format-number'

export default {
  data() {
    return {
      isLoading: false,
      headers: [
        // { key: "id", label: "ID", width: 50 },
        { key: "username", label: "Username", width: 250 },
        { key: "name", label: "Name", width: 250 },
        { key: "phoneNumber", label: "Number Phone", width: 200 },
        { key: "address", label: "Address", width: 600 },
        { key: "tiktokBuyerId", label: "Products", width: 200 },
      ],
      buyers: [],
      pagination: {
        currentPage: 1,
        perPage: 10,
        totalResults: 1,
        totalPages: 1,
      },
      isProductLoading: false,
      products: [],
      productHeader: [
        { key: "skuId", label: "Product ID" },
        { key: "name", label: "Name", width: 400 },
      ],
      showModal: false,
      startIndex: 1,
      selectedSort: null,
      isShowModalWhatsappTemplate: false,
      isShowModalWhatsappBlast: false,
      messageTemplate: '',
      messageList: [],
      TIKTOK_SELECTED_SORT_OPTIONS,
      showModalSubs: false,
    };
  },
  computed:{
    whatsapp() {
      return this.$config.appName === "tiksender"
        ? this.$config.tiksenderWhatsapp
        : this.$config.supportsellerWhatsapp;
    },
    website() {
      return this.$config.appName === "tiksender"
        ? this.$config.tiksenderWebsite
        : this.$config.supportsellerWebsite;
    },
    selectedItems() {
      return this.buyers.filter(buyer => !!buyer.selected && !buyer.disabled)
    },
    isSubscription() {
      return this.$store.getters["subscription/getHasBuyerPlan"];
    },
  },
  watch: {
    isSubscription(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.getDataBuyers();
      }
    }
  },
  methods: {
    async onStart() {
      const getSubscription = await this.$store.dispatch(
        "subscription/setSelectedSubscription",
        "buyer"
      );

      if (!getSubscription) {
        this.showModalSubs = true;
        return;
      }

      const config = {
        startIndex: this.startIndex ? this.startIndex : 1,
        selectedSort: this.selectedSort ? this.selectedSort : 5,
      };
      const res = await window.electron.ipcRenderer.invoke(
        "start-get-buyers-info",
        config
      );

      this.getDataBuyers();

      if (res?.status === "succes") {
        this.$snackbar.success("Fetching buyer data is complete.")
      } else if(res?.status === "limit") {
        window.alert("Data retrieval reaches limit. Please try again in 1 hour.");
      }
      console.log("res.data :", res.data);
      console.log("res.status :", res.status);
    },
    async getDataBuyers() {
      try {
        if (this.isSubscription) {
          this.isLoading = true;
          const data = {
            params: {
              page: this.pagination.currentPage,
              limit: this.pagination.perPage,
            }
          }
          const res = await window.electron.ipcRenderer.invoke(
            "get-buyers-info",
            data
          );
          this.buyers = res.data.map((buyer) => ({
            ...buyer,
            selected: false,
            disabled: !buyer.phoneNumber,
          }))
          this.pagination = res.pagination;
          this.isLoading = false;
        }
      } catch (error) {
        console.error("Error while get data buyers", error)
      }
    },
    async getMessageReceiverList() {
      this.messageList = [this.selectedItems.map(item => ({
        name: `@${item.username}`,
        phoneNumber: convertToWhatsappNumber(item.phoneNumber)
      }))];
    },
    changePage(pageNumber) {
      this.pagination.currentPage = pageNumber;
      this.getDataBuyers();
    },
    async openProductModal(tiktokBuyerId) {
      this.showModal = true;
      this.isProductLoading = true;
      this.products = [];
      const res = await window.electron.ipcRenderer.invoke(
        "get-buyer-products",
        tiktokBuyerId
      );
      for (const product of res.data) {
        this.products.push(product);
      }
      this.isProductLoading = false;
    },
    closeModal() {
      this.showModal = false;
    },
    async onConfirmWhatsappTemplate(messageTemplate) {
      await this.getMessageReceiverList();
      this.messageTemplate = messageTemplate;

      setTimeout(() => {
        this.isShowModalWhatsappBlast = true
      }, 1000);
    },
    sendWhatsapp(phoneNumber) {
      if (phoneNumber) {
        window.open(
          `https://api.whatsapp.com/send?phone=${convertToWhatsappNumber(
            phoneNumber
          )}&text=`,
          "_blank"
        );
      } else if(this.isSubscription){
        this.showModalSubs = true;
        return;
      }
    },
    gotoWhatsappAdmin() {
      window.open(`https://wa.me/${this.whatsapp}`, "_blank");
    },
    async exportDataToExcel(){
      console.log("Exporting data to Excel...");
      const resData = await window.electron.ipcRenderer.invoke(
        "export-data-to-excel",
        {
          fileName: 'buyer',
          endpoint: '/tiktok-buyers'
        }
      );
      window.alert(
        `Successfully created Excel file at:\n" ${resData.filePath} "`
      );
      console.log("Export data to Excel:", resData);
    },
  },
  async mounted() {
    this.isLoading = true
    await this.getDataBuyers();
    this.isLoading = false
  },
};
</script>

<template>
  <div v-if="isLoading" class="flex flex-col">
    <slot name="loading">
      <div class="flex items-center justify-center space-x-2">
        <Icon name="spinner" :size="24" class="animate-spin text-primary" />
        <!-- <span>{{ loadingText }}</span> -->
      </div>
    </slot>
  </div>

  <Card v-else>
    <div class="flex justify-between">
      <h1 class="text-xl font-semibold text-dark2">Buyer Data</h1>
      <div v-if="isSubscription" class="flex gap-5">
        <Button theme="primary-outline" class="h-9 flex-grow"
          @click="isShowModalWhatsappTemplate = true" :disabled="!selectedItems.length">
          <Icon name="whatsapp" />
          <span>Send WhatsApp</span>
        </Button>
        <Button @click="exportDataToExcel()"> Export to Excel </Button>
      </div>
    </div>

    <template v-if="isSubscription">
      <Table selectable :rows.sync="buyers" :headers="headers" :loading="isLoading" :pagination="pagination"
        show-row-number @change:page="changePage" class="mt-10 rounded-b-[10px]" classRow="whitespace-wrap">
        <template #col.phoneNumber="{ row }">
          <div class="flex items-center gap-1 hover:cursor-pointer text-primary" @click="sendWhatsapp(row.phoneNumber)">
            {{ row.phoneNumber }}
          </div>
        </template>

        <template #col.tiktokBuyerId="{ row }">
          <Button theme="primary-outline" @click="openProductModal(row.tiktokBuyerId)">
            View Products
          </Button>
          </div>
        </template>
      </Table>

      <div>
        <div class="flex gap-5 mt-7">
          <Textfield v-model="startIndex" label="Starting from the order" placeholder="" type="number" :inputNumberMin="1"
            class="flex-1" />

          <Dropdown v-model="selectedSort" :showOptionAll="false" :options="TIKTOK_SELECTED_SORT_OPTIONS"
            label="Sort by" placeholder="Time created (oldest first)" class="flex-1" />
        </div>
        <Button @click="onStart" class="my-4"> Retrieve buyer data </Button>
      </div>
    </template>

    <template v-else>
      <div class="border border-secondary/[30%] bg-white rounded-[10px] xl:w-[500px] w-full h-full pb-10 my-5">
        <div class="bg-secondary/[8%] h-[50px] md:h-[55px] flex items-center justify-between"></div>
        <div class="flex justify-center">
          <div class="mx-auto mt-8 text-center">
            <img src="~/assets/icons/empty.svg" alt="empty" class="h-10 md:h-12 mx-auto">
            <p class="text-xs md:text-sm pt-3"> Oops! You have not subscribed to this feature</p>
          </div>
        </div>
      </div>

      <footer class="flex justify-between items-center p-5 -m-5 mt-0 bg-primary/5">
        <p class="text-sm font-bold">Contact us:</p>

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
                website
              }}
            </a>
          </div>
        </div>
      </footer>
    </template>

    <AppTemplateModal v-model="isShowModalWhatsappTemplate" modal-type="whatsapp-blast" template-type="whatsapp"
      @confirm="onConfirmWhatsappTemplate" />
    <AppWhatsappModal v-model="isShowModalWhatsappBlast" :list="messageList" :message="messageTemplate" />

    <!--  Modal table product -->
    <div>
      <transition name="modal">
        <div v-if="showModal" class="modal__overlay" @click="closeModal">
          <div class="modal max-w-" @click.stop>
            <h3 class="modal__title">Product</h3>

            <div class="modal__content">
              <Table :rows.sync="products" :headers="productHeader" :loading="isProductLoading"
                classRow="whitespace-wrap" show-row-number>
              </Table>
            </div>

            <div class="modal__footer">
              <Button class="w-28" @click="closeModal">Close</Button>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <Modal
      v-model="showModalSubs"
      title="You haven't subscribed yet. Contact admin on WhatsApp?"
      @confirm="gotoWhatsappAdmin"
      confirm-btn-text="Yes"
    >
    </Modal>
  </Card>
</template>

<style scoped lang="postcss">
/* Modal Style */
.modal {
  @apply w-[90%] bg-white transition-all p-6 rounded-xl shadow;
}

.modal__overlay {
  @apply flex items-center justify-center fixed z-50 top-0 left-0 w-full h-full bg-black bg-opacity-40;
}

.modal__title {
  @apply text-xl font-medium;
}

.modal__content {
  @apply mt-4;
}

.modal__footer {
  @apply flex items-center justify-end space-x-4;
}

/* Animasi Masuk dan Keluar */
.modal-enter-active,
.modal-leave-active {
  @apply transition-all;
}

.modal-enter .modal,
.modal-leave-to .modal {
  @apply scale-50 opacity-0;
}

table.products-table {
  border-collapse: separate;
  border-spacing: 10px;
  *border-collapse: expression("separate", cellSpacing="10px");
}

table.products-table tr th {
  text-align: left;
}
</style>
