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
      tw-z-20
      tw-flex
      tw-select-none
      tw-flex-col
      tw-items-center
      tw-justify-start
      tw-overflow-visible
    "
    :style="{
      width: 0,
      top: 'var(--gantt-header-height)',
      height: 'calc(100% - var(--gantt-header-height))',
      transform: `translateX(${offset}px)`,
    }"
  >
    <div
      class="
        tw-group
        tw-pointer-events-auto
        tw-sticky
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
      :style="{
        top: 'var(--gantt-header-height)',
        minHeight: 'var(--gantt-marker-height)',
      }"
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
    <div
      class="tw-sticky tw-w-px"
      :class="className"
      :style="{
        top: 'calc(var(--gantt-header-height) + var(--gantt-marker-height))',
        height: 'calc(var(--gantt-height) - var(--gantt-header-height) - var(--gantt-marker-height))',
      }"
    />
  </div>
</template>
<style scoped>
.today-marker {
  background-color: var(--q-primary);
  color: white;
}
</style>
