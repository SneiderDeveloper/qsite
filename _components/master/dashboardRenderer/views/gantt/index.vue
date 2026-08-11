<script lang="ts">
import { defineComponent } from 'vue'
import controller from './controller'
import cardContainer from '../../components/cardContainer.vue'
import noData from '../../components/noData.vue'
import ganttSidebar from './components/sidebar/index.vue'
import ganttTimeline from './components/timeline/index.vue'
import ganttFeature from './components/feature/index.vue'
import ganttMarker from './components/marker/index.vue'

export default defineComponent({
  props: {
    apiRoute: {
      type: String,
      default: null,
    },
    data: {
      type: Object,
      default: {},
    },
    className: {
      type: String,
      default: '',
    },
    header: {
      type: Object,
      default: null,
    },
    toolbox: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    cardContainer,
    noData,
    ganttSidebar,
    ganttTimeline,
    ganttFeature,
    ganttMarker,
  },
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<template>
  <card-container
    :className="className"
    :isLoading="isLoading"
    :isEmpty="!thereAreFeatures"
    :header="ganttData?.header || header"
    @reloadData="fetchGanttData"
    @updateFilters="filters => updateFilters(filters)"
    :toolbox="{
      tools,
      features: {
        range: true,
        today: true,
        zoomOut: true,
        zoomIn: true,
        ...toolbox,
      },
    }"
  >
    <!-- Skeleton -->
    <div v-show="isLoading" class="tw-flex tw-flex-col tw-gap-3.5 tw-h-[337px]">
      <section v-for="row in 6" :key="row" class="tw-flex tw-items-center tw-gap-3.5">
        <q-skeleton type="QChip" class="tw-h-9 tw-w-1/4" />
        <q-skeleton
          type="QChip"
          class="tw-h-9"
          :class="row % 2 ? 'tw-w-2/4' : 'tw-w-1/3'"
        />
      </section>
    </div>
    <no-data v-if="!thereAreFeatures && !isLoading" class="tw-h-[337px]" />
    <!-- Gantt -->
    <div
      v-if="thereAreFeatures && !isLoading"
      ref="ganttRef"
      class="
        gantt
        tw-relative
        tw-isolate
        tw-grid
        tw-h-[337px]
        tw-w-full
        tw-flex-none
        tw-select-none
        tw-overflow-auto
        tw-rounded-xl
        tw-bg-neutral-50
      "
      :style="cssVariables"
      @scroll="handleScroll"
    >
      <gantt-sidebar
        v-if="showSidebar"
        :groups="groups"
        :labels="ganttData?.sidebar?.labels"
        @select="row => selectFeature(row)"
      />
      <gantt-timeline>
        <!-- Features -->
        <div
          class="tw-absolute tw-left-0 tw-top-0 tw-h-full tw-w-max tw-space-y-4"
          :style="{ marginTop: 'var(--gantt-header-height)' }"
        >
          <div v-for="group in groups" :key="group.id">
            <div v-if="group?.name" :style="{ height: 'var(--gantt-row-height)' }" />
            <div
              v-for="row in group.rows"
              :key="row.id"
              class="tw-relative"
              :style="{ height: `calc(var(--gantt-row-height) * ${row.subRows})` }"
            >
              <div
                v-for="feature in row.features"
                :key="feature.id"
                class="tw-absolute tw-w-full"
                :style="{
                  top: `calc(var(--gantt-row-height) * ${feature.subRow})`,
                  height: 'var(--gantt-row-height)',
                }"
              >
                <gantt-feature
                  :feature="feature"
                  @select="selected => selectFeature(selected)"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- Markers -->
        <gantt-marker
          v-for="marker in markers"
          :key="marker.id"
          :date="marker.date"
          :label="marker.label"
          :className="marker?.className"
        />
        <gantt-marker
          v-if="showToday"
          :date="today"
          :label="todayLabel"
          className="today-marker"
        />
      </gantt-timeline>
    </div>
  </card-container>
</template>
<style scoped>
.gantt::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.gantt::-webkit-scrollbar-track {
  margin-left: var(--gantt-sidebar-width);
}
</style>
