<script>
import Teleport from 'vue2-teleport'

export default {
  components: {
    Teleport
  },
  props: {
    text: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      show: false,
      tooltipStyle: {
        position: 'absolute',
        zIndex: '1050'
      }
    };
  },
  methods: {
    showTooltip() {
      this.show = true;
      this.$nextTick(() => {
        this.setPosition();
      });
    },
    hideTooltip() {
      this.show = false;
    },
    setPosition() {
      const triggerElement = this.$refs.trigger;
      const tooltipElement = document.querySelector('.tooltip__content');

      if (!triggerElement || !tooltipElement) return;
      const triggerRect = triggerElement.getBoundingClientRect();
      const tooltipRect = tooltipElement.getBoundingClientRect();

      const top = window.scrollY + triggerRect.top - tooltipRect.height - 10;
      const left = window.scrollX + triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

      this.tooltipStyle = {
        ...this.tooltipStyle,
        top: `${top}px`,
        left: `${left}px`,
      }
    }
  }
};
</script>

<template>
  <div ref="trigger" class="tooltip__container" @mouseover="showTooltip" @mouseleave="hideTooltip">
    <slot></slot>

    <Teleport to="body" v-if="show">
      <div class="tooltip__content" :style="tooltipStyle">
        {{ text }}
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="postcss">
.tooltip {
  &__content {
    @apply bg-white text-sm text-green2 border border-green2 rounded-md p-2.5;

    &::after {
      @apply block absolute left-1/2 -translate-x-1/2 bottom-[-18px] w-0 h-0 border-[9px] border-transparent border-t-white;
      content: '';
    }

    &::before {
      @apply block absolute left-1/2 -translate-x-1/2 bottom-[-20px] w-0 h-0 border-[10px] border-transparent border-t-green2;
      content: '';
    }
  }
}
</style>
