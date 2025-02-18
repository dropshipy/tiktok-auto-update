<script>
export default {
  data() {
    return {
      isLoading: true,
    };
  },
};
</script>

<template>
  <Card>
    <h1 class="text-xl font-semibold text-dark2 capitalize">
      {{ $config.appName }} Tutorial
    </h1>

    <div class="mt-5 rounded-xl overflow-hidden relative">
      <iframe
        :src="$config.tutorialLink"
        @load="isLoading = false"
        height="500"
        width="100%"
        title="Tutorial"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      />
      <div
        v-if="isLoading"
        class="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop:blur-md"
      >
        <Icon name="spinner" class="animate-spin" :size="24" />
        <p class="text-xl">Loading...</p>
      </div>
    </div>
  </Card>
</template>
