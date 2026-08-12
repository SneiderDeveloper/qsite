<script lang="ts">
import { defineComponent } from 'vue'
import controller from './controller'

export default defineComponent({
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<template>
  <div class="tw-relative tw-flex tw-h-full tw-w-max tw-flex-none tw-overflow-clip">
    <!-- Blocks: a month when the range is daily, a quarter or a year otherwise -->
    <div
      v-for="block in blocks"
      :key="block.id"
      class="tw-relative tw-flex tw-flex-col tw-border-l tw-border-gray-100"
    >
      <!-- Header -->
      <div
        class="
          tw-sticky
          tw-top-0
          tw-z-20
          tw-grid
          tw-w-full
          tw-shrink-0
          tw-bg-white/90
          tw-backdrop-blur-sm
        "
        :style="{ height: 'var(--gantt-header-height)' }"
      >
        <div>
          <p
            class="
              tw-sticky
              tw-inline-flex
              tw-whitespace-nowrap
              tw-px-3
              tw-py-2
              tw-text-xs
              tw-font-semibold
              tw-text-gray-500
            "
            :style="{ left: 'var(--gantt-sidebar-width)' }"
          >
            {{ block.title }}
          </p>
        </div>
        <div class="tw-grid tw-w-full" :style="gridColumns(block.columns.length)">
          <div
            v-for="(column, index) in block.columns"
            :key="`${block.id}-header-${index}`"
            class="
              tw-shrink-0
              tw-border-b
              tw-border-gray-100
              tw-py-1
              tw-text-center
              tw-text-xs
              tw-text-gray-500
            "
          >
            <span class="tw-flex tw-items-center tw-justify-center tw-gap-1">
              <span>{{ column.label }}</span>
              <span v-if="column?.sublabel" class="tw-text-gray-400">
                {{ column.sublabel }}
              </span>
            </span>
          </div>
        </div>
      </div>
      <!-- Columns -->
      <div
        class="tw-grid tw-h-full tw-w-full tw-divide-x tw-divide-gray-100"
        :style="gridColumns(block.columns.length)"
      >
        <div
          v-for="(column, index) in block.columns"
          :key="`${block.id}-column-${index}`"
          class="tw-h-full"
          :class="{ 'tw-bg-neutral-100/60': column?.secondary }"
        />
      </div>
    </div>
    <slot />
  </div>
</template>
