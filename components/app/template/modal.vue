<script>
import templateMixin from "~/mixins/template";
import { convertToWhatsappNumber } from "~/utils/format-number";

export default {
  mixins: [templateMixin],

  props: {
    value: {
      type: Boolean,
      default: false,
    },
    modalType: {
      type: String,
      required: true,
      validator: (value) =>
        ["email", "whatsapp", "whatsapp-blast"].includes(value),
    },
    payload: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      currentContent: "",
    };
  },
  computed: {
    isShow: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
    title() {
      switch (this.modalType) {
        case "email":
          return "Send email";
        case "whatsapp":
          return "Send whatsapp";
        case "whatsapp-blast":
          return "Send whatsapp at once";
      }
    },
    description() {
      switch (this.modalType) {
        case "email":
          return "You will be directed to the web/email application";
        case "whatsapp":
          return "You will be directed to the WhatsApp web/application";
        case "whatsapp-blast":
          return "Are you sure you want to send WhatsApp at once?";
      }
    },
  },
  watch: {
    async isShow(val) {
      if (val) {
        await this.getTemplate();
        this.currentContent = this.templateContent;
      }
    },
  },
  methods: {
    onSave() {
      this.templateContent = this.currentContent;
      this.saveTemplate();
    },
    onConfirm() {
      switch (this.modalType) {
        case "email":
          this.sendEmail(this.payload?.email, this.templateContent);
          break;
        case "whatsapp":
          this.sendWhatsapp(this.payload?.whatsapp, this.templateContent);
          break;
        case "whatsapp-blast":
          this.$emit("confirm", this.templateContent);
          break;
      }

      setTimeout(() => {
        this.isShow = false;
      }, 1000);
    },
    sendWhatsapp(phone, content) {
      window.open(
        `https://api.whatsapp.com/send?phone=${convertToWhatsappNumber(
          phone
        )}&text=${content}`,
        "_blank"
      );
    },
    sendEmail(email, content) {
      window.open(
        `mailto:${email}?subject=Undangan Afiliasi Tiktok&body=${content}`,
        "_blank"
      );
    },
  },
};
</script>

<template>
  <Modal
    v-model="isShow"
    :title="title"
    confirm-btn-text="Yes, Send"
    @confirm="onConfirm"
  >
    <h3 class="text-dark3 -mt-2">{{ description }}</h3>

    <div class="my-5 relative">
      <Textfield
        v-model="currentContent"
        type="textarea"
        input-class="min-h-72"
        :max-height="500"
      />

      <Button
        theme="tertiary"
        class="text-primary absolute top-2 right-2 bg-white bg-opacity-90"
        :disabled="currentContent === templateContent"
        @click="onSave"
      >
        <Icon name="save" />
        <span>Save</span>
      </Button>
    </div>
  </Modal>
</template>
