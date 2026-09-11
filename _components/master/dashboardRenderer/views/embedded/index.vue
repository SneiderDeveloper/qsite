<script lang="ts">
import { defineComponent } from 'vue'
import controller from './controller'
import cardContainer from '../../components/cardContainer.vue'
import noData from '../../components/noData.vue'

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
    :isEmpty="!thereAreData"
    :header="embeddedData?.header || header"
    @reloadData="fetchEmbeddedData"
    @updateFilters="filters => updateFilters(filters)"
    :toolbox="{
      tools,
      features: {
        newTab: true,
        ...toolbox,
      },
    }"
  >
    <!-- Skeleton -->
    <q-skeleton
      v-show="isLoading"
      type="rect"
      class="tw-w-full tw-rounded-2xl"
      :style="{ height }"
    />
    <no-data v-if="!thereAreData && !isLoading" class="tw-h-[337px]" />
    <!-- Embedded -->
    <iframe
      v-if="thereAreData && !isLoading"
      v-bind="attributes"
      class="tw-w-full tw-rounded-2xl tw-border-0"
      :style="{ height }"
    />
  </card-container>
</template>
