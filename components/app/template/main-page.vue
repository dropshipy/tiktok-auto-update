<script>
import templateMixin from "~/mixins/template";

export default {
  mixins: [templateMixin],

  mounted() {
    this.getTemplate();
  },
};
</script>

<template>
  <Card>
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-dark2 capitalize">
        Template {{ templateType }}
      </h1>

      <button
        @click="copy"
        class="text-gray-400"
        :class="{ '!text-gray-200 pointer-events-none': !templateId }"
      >
        <Icon name="copy" />
      </button>
    </div>

    <Textfield
      v-model="templateContent"
      label="Template"
      type="textarea"
      placeholder="Enter the email template here"
      class="mt-11"
      input-class="min-h-72"
      :max-height="500"
    />

    <Button class="mt-6 ml-auto" @click="isShowModal = true"
      >Save Template</Button
    >

    <Modal
      v-model="isShowModal"
      :title="modalTitle"
      confirm-btn-text="Yes"
      @confirm="saveTemplate"
    >
      <p class="mb-8">{{ modalDescription }}</p>
    </Modal>
  </Card>
</template>
