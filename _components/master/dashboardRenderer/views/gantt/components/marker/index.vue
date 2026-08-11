<script lang="ts">
import { defineComponent } from 'vue'
import controller from './controller'

export default defineComponent({
  props: {
    date: {
      type: Object,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: 'tw-bg-neutral-200 tw-text-neutral-700',
    },
  },
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<template>
  <div
    class="
      tw-pointer-events-none
      tw-absolute
      tw-left-0
      tw-top-0
      tw-z-20
      tw-flex
      tw-h-full
      tw-select-none
      tw-flex-col
      tw-items-center
      tw-justify-center
      tw-overflow-visible
    "
    :style="{ width: 0, transform: `translateX(${offset}px)` }"
  >
    <div
      class="
        tw-group
        tw-pointer-events-auto
        tw-sticky
        tw-top-0
        tw-flex
        tw-select-auto
        tw-flex-col
        tw-flex-nowrap
        tw-items-center
        tw-justify-center
        tw-whitespace-nowrap
        tw-rounded-b-lg
        tw-px-2
        tw-py-1
        tw-text-xs
        tw-font-semibold
      "
      :class="className"
    >
      {{ label }}
      <span
        class="
          tw-max-h-0
          tw-overflow-hidden
          tw-font-normal
          tw-opacity-80
          tw-transition-all
          group-hover:tw-max-h-8
        "
      >
        {{ formattedDate }}
      </span>
    </div>
    <div class="tw-h-full tw-w-px" :class="className" />
  </div>
</template>
<style scoped>
.today-marker {
  background-color: var(--q-primary);
  color: white;
}
</style>
