<script lang="ts">
import { defineComponent } from 'vue'
import controller from './controller'

export default defineComponent({
  props: {
    groups: {
      type: Array,
      default: () => [],
    },
    labels: {
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
    class="
      tw-sticky
      tw-left-0
      tw-z-30
      tw-h-max
      tw-min-h-full
      tw-overflow-clip
      tw-border-r
      tw-border-gray-100
      tw-bg-white/90
      tw-backdrop-blur-md
    "
  >
    <!-- Header -->
    <div
      class="
        tw-sticky
        tw-top-0
        tw-z-10
        tw-flex
        tw-shrink-0
        tw-items-end
        tw-justify-between
        tw-gap-2.5
        tw-border-b
        tw-border-gray-100
        tw-bg-white/90
        tw-p-2.5
        tw-text-xs
        tw-font-semibold
        tw-text-gray-500
        tw-backdrop-blur-sm
      "
      :style="{ height: 'var(--gantt-header-height)' }"
    >
      <p class="tw-flex-1 tw-truncate tw-text-left">{{ nameLabel }}</p>
      <p class="tw-shrink-0">{{ durationLabel }}</p>
    </div>
    <!-- Groups -->
    <div class="tw-space-y-4">
      <div v-for="group in groups" :key="group.id">
        <p
          v-if="group?.name"
          class="
            tw-w-full
            tw-truncate
            tw-p-2.5
            tw-text-left
            tw-text-xs
            tw-font-semibold
            tw-text-gray-500
          "
          :style="{ height: 'var(--gantt-row-height)' }"
        >
          {{ group.name }}
        </p>
        <div
          v-if="!group.rows.length"
          class="
            tw-flex
            tw-items-center
            tw-gap-2
            tw-p-2.5
            tw-text-xs
            tw-italic
            tw-text-gray-400
          "
          :style="{ height: 'var(--gantt-row-height)' }"
        >
          <i class="fa-regular fa-circle-minus tw-shrink-0" />
          <span class="tw-truncate">{{ emptyLabel }}</span>
        </div>
        <div class="tw-divide-y tw-divide-gray-100">
          <div
            v-for="row in group.rows"
            :key="row.id"
            class="
              tw-relative
              tw-flex
              tw-cursor-pointer
              tw-items-center
              tw-gap-2.5
              tw-p-2.5
              tw-text-xs
              hover:tw-bg-neutral-100
            "
            :style="rowHeight(row)"
            @click="$emit('select', row)"
          >
            <div
              v-if="row?.status?.color"
              class="tw-h-2 tw-w-2 tw-shrink-0 tw-rounded-full"
              :style="{ backgroundColor: row.status.color }"
            />
            <p class="tw-flex-1 tw-truncate tw-text-left tw-font-medium">
              {{ row.name }}
            </p>
            <q-tooltip>{{ row.name }}</q-tooltip>
            <p class="tw-shrink-0 tw-text-gray-400">{{ duration(row) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
