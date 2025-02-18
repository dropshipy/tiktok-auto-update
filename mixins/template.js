import copyToClipboard from "~/utils/copy-to-clipboard";

export default {
  props: {
    templateType: {
      type: String,
      required: true,
      validator: (value) => ["email", "whatsapp"].includes(value),
    },
  },
  data() {
    return {
      templateContent: "",
      templateId: null,
      isShowModal: false,
    };
  },
  computed: {
    userInfo() {
      return this.$store.getters["user/getUserInfo"];
    },
    modalTitle() {
      if (this.templateType === "email") {
        return this.templateId
          ? "Change Email Template"
          : "Create Email Template";
      }
      return this.templateId
        ? "Change WhatsApp Template"
        : "Create WhatsApp Template";
    },
    modalDescription() {
      return this.templateId
        ? "Are you sure you want to make changes to the template?"
        : "Are you sure you want to create a new template?";
    },
  },
  methods: {
    copy() {
      copyToClipboard(this.templateContent, () => {
        this.$snackbar.success("The text was copied successfully");
      });
    },
    async getTemplate() {
      try {
        const resData = await window.electron.ipcRenderer.invoke(
          `get-${this.templateType}-template`,
          this.userInfo.subscriptionId
        );

        console.log(`get template ${this.templateType}`, resData);

        if (resData) {
          this.templateContent = resData.data?.content;
          this.templateId = resData.data?.id;
        }
      } catch (error) {
        this.$snackbar.error(
          `Failed to retrieve ${this.templateType} template`
        );
        console.error(`Error getting email ${this.templateType}: `, error);
      }
    },
    saveTemplate() {
      if (this.templateId) {
        this.updateTemplate();
      } else {
        this.createTemplate();
      }
    },
    async createTemplate() {
      try {
        const resData = await window.electron.ipcRenderer.invoke(
          `create-${this.templateType}-template`,
          {
            content: this.templateContent,
            subscriptionId: this.userInfo.subscriptionId,
          }
        );

        if (resData?.error) {
          this.$snackbar.error(
            `Failed to create ${this.templateType} template`
          );
          console.error(
            `Error creating ${this.templateType} template: `,
            resData.error
          );
        } else {
          this.$snackbar.success(
            `Success create ${this.templateType} template`
          );
          this.getTemplate();
        }
      } catch (error) {
        this.$snackbar.error(`Failed to save ${this.templateType} template`);
        console.error(`Error saving ${this.templateType} template: `, error);
      } finally {
        this.isShowModal = false;
      }
    },
    async updateTemplate() {
      try {
        const resData = await window.electron.ipcRenderer.invoke(
          `update-${this.templateType}-template`,
          {
            templateId: this.templateId,
            content: this.templateContent,
          }
        );

        if (resData?.error) {
          this.$snackbar.error(
            `Failed to change ${this.templateType} template`
          );
          console.error(
            `Error saving ${this.templateType} template: `,
            resData.error
          );
        } else {
          this.$snackbar.success(
            `Success success ${this.templateType} template`
          );
        }
      } catch (error) {
        this.$snackbar.error(`Failed to save ${this.templateType} template`);
        console.error(`Error saving ${this.templateType} template: `, error);
      } finally {
        this.isShowModal = false;
      }
    },
  },
};
