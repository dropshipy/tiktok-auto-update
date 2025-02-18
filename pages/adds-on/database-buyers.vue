<script>
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
        { key: "name", label: "Nama", width: 250 },
        { key: "phoneNumber", label: "Nomor Telepon", width: 200 },
        { key: "address", label: "Alamat", width: 600 },
        { key: "tiktokBuyerId", label: "Produk", width: 200 },
      ],
      buyers: [],
      pagination: {
        currentPage: 1,
        perPage: 20,
        totalResults: 1,
        totalPages: 1,
      },
      isProductLoading: false,
      products: [],
      productHeader: [
        { key: "skuId", label: "Produk ID" },
        { key: "name", label: "Nama", width: 400 },
      ],
      showModal: false,
      selectedSort: null,
      isShowModalWhatsappTemplate: false,
      isShowModalWhatsappBlast: false,
      messageTemplate: '',
      messageList: [],
    };
  },
  computed: {
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
    isAdmin() {
      return this.$store.getters["user/getUserInfo"].role === 'admin';
    },
    selectedItems() {
      return this.buyers.filter(buyer => !!buyer.selected && !buyer.disabled)
    },
  },
  methods: {
    async getDataBuyers() {
      try {
        this.isLoading = true;
        const payload = {
          page: this.pagination.currentPage,
          limit: this.pagination.perPage,
        };
        const res = await window.electron.ipcRenderer.invoke(
          "get-buyers-admin",
          payload
        );
        this.buyers = res.data.map((buyer) => ({
          ...buyer,
          selected: false,
          disabled: !buyer.phoneNumber,
        }));
        this.pagination = res.pagination;
        this.isLoading = false;
      } catch (error) {
        console.error(error);
      }
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
    changePage(pageNumber) {
      this.pagination.currentPage = pageNumber;
      this.getDataBuyers();
    },
    sendWhatsapp(phoneNumber) {
      if (phoneNumber) {
        window.open(
          `https://api.whatsapp.com/send?phone=${convertToWhatsappNumber(
            phoneNumber
          )}&text=`,
          "_blank"
        );
      }
    },
    closeModal() {
      this.showModal = false;
    },
    async getMessageReceiverList() {
      this.messageList = [this.selectedItems.map(item => ({
        name: `@${item.username}`,
        phoneNumber: convertToWhatsappNumber(item.phoneNumber)
      }))];
    },
    async onConfirmWhatsappTemplate(messageTemplate) {
        await this.getMessageReceiverList();
        this.messageTemplate = messageTemplate;

        setTimeout(() => {
          this.isShowModalWhatsappBlast = true
        }, 1000);
      },
  },
  async mounted() {
    if (this.isAdmin) {
      await this.getDataBuyers();
    }
  },
};
</script>

<template>
  <Card>
    <div class="flex justify-between">
      <h1 class="text-xl font-semibold text-dark2">Data Pembeli</h1>
      <div v-if="isAdmin">
        <Button theme="primary-outline" class="h-9 flex-grow"
          @click="isShowModalWhatsappTemplate = true" :disabled="!selectedItems.length">
          <Icon name="whatsapp" />
          <span>Kirim WA</span>
        </Button>
      </div>
    </div>

    <template v-if="isAdmin">
      <Table
        selectable
        :rows.sync="buyers"
        :headers="headers"
        :loading="isLoading"
        :pagination="pagination"
        show-row-number
        @change:page="changePage"
        class="mt-10 rounded-b-[10px]"
        classRow="whitespace-wrap"
      >
      <template #col.phoneNumber="{ row }">
          <div class="flex items-center gap-1 hover:cursor-pointer text-primary" @click="sendWhatsapp(row.phoneNumber)">
            {{ row.phoneNumber }}
          </div>
        </template>

        <template #col.tiktokBuyerId="{ row }">
          <Button theme="primary-outline" @click="openProductModal(row.id)">
            Lihat Produk
          </Button>
          </div>
        </template>
      </Table>
    </template>

    <template v-else>
      <div class="border border-secondary/[30%] bg-white rounded-[10px] xl:w-[500px] w-full h-full pb-10 my-5">
        <div class="bg-secondary/[8%] h-[50px] md:h-[55px] flex items-center justify-between"></div>
        <div class="flex justify-center">
          <div class="mx-auto mt-8 text-center">
            <img src="~/assets/icons/empty.svg" alt="empty" class="h-10 md:h-12 mx-auto">
            <p class="text-xs md:text-sm pt-3"> Oops! Fitur ini hanya tersedia untuk admin</p>
          </div>
        </div>
      </div>

      <footer class="flex justify-between items-center p-5 -m-5 mt-0 bg-primary/5">
        <p class="text-sm font-bold">Hubungi Kami:</p>

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
              <Button class="w-28" @click="closeModal">Tutup</Button>
            </div>
          </div>
        </div>
      </transition>
    </div>
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
