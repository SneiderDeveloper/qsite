<script lang="ts">
import { defineComponent } from 'vue'
import controller from './controller'

export default defineComponent({
  props: {
    feature: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['select'],
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<template>
  <div
    class="tw-relative tw-flex tw-w-max tw-min-w-full tw-py-0.5"
    :style="{ height: 'var(--gantt-row-height)' }"
  >
    <div
      class="tw-absolute tw-top-0.5"
      :style="{
        height: 'calc(var(--gantt-row-height) - 4px)',
        width: `${width}px`,
        left: `${offset}px`,
      }"
    >
      <div
        class="
          tw-flex
          tw-h-full
          tw-w-full
          tw-cursor-pointer
          tw-items-center
          tw-gap-2
          tw-rounded-lg
          tw-border
          tw-border-gray-100
          tw-bg-white
          tw-px-2
          tw-text-xs
          tw-shadow-sm
          tw-transition-all
          hover:tw-shadow-md
        "
        :class="feature?.className"
        @click="$emit('select', feature)"
      >
        <div
          v-if="color"
          class="tw-h-2 tw-w-2 tw-shrink-0 tw-rounded-full"
          :style="{ backgroundColor: color }"
        />
        <p class="tw-flex-1 tw-truncate tw-font-medium">
          {{ feature?.name }}
        </p>
        <q-tooltip>{{ tooltip }}</q-tooltip>
      </div>
    </div>
  </div>
</template>
