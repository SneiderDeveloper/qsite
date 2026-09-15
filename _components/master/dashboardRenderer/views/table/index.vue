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
    :isEmpty="!thereAreRows"
    :header="tableData?.header || header"
    @reloadData="fetchTableData"
    @updateFilters="filters => updateFilters(filters)"
    :toolbox="{ features: toolbox }"
  >
    <div 
      class="
        tw-overflow-auto 
        tw-pr-1
        tableContainer
      "
      :class="{
        'tw-flex tw-flex-col tw-justify-center tw-h-2/3': !thereAreRows,
      }"
    >
      <no-data v-if="!thereAreRows && !isLoading" class="tw-h-[337px]"/>
      <!-- Skeleton -->
      <div 
        v-show="isLoading" 
        class="tw-grid tw-grid-flow-col  tw-h-[337px] table"
      >
        <!-- Skeleton Column -->
        <div v-for="column in 3">
          <q-skeleton type="QChip" class="tw-h-7" />
          <!-- Skeleton body -->
          <section 
            v-for="row in 4"
            class="tw-flex tw-items-center tw-h-12 tw-my-3.5 tw-mr-3.5" 
          >
            <q-skeleton type="QChip" class="tw-w-full tw-h-12" />
          </section>
        </div>
      </div>
      <div 
        v-if="thereAreRows && !isLoading" 
        class="tw-grid tw-grid-flow-col  tw-h-[337px] table"
      >
        <!-- Columns -->
        <div 
          v-for="column in tableData?.columns"
          class="tw-min-w-24"
          :class="{
            'tw-text-center': column?.align === 'center',
            'tw-text-right': column?.align === 'right',
            'tw-text-left': column?.align === 'left',
          }"
        >
        <!-- Header -->
          <section 
            class="
              show-filter-hover 
              tw-h-7 
              tw-text-sm 
              tw-font-semibold 
              tw-sticky 
              tw-top-0 
              tw-bg-white 
              tw-z-10
              tw-mb-3.5
              tw-shadow-[0_-15px_5px_0px_rgba(255,255,255,1)]
            "
          >
            <span :class="column?.headerClass">
              {{ formatted(column?.label, column?.format) }}
            </span>
            <q-btn
              v-if="column?.sortable"
              unelevated 
              size="xs" 
              class="tw-p-1 tw-text-sm tw-bg-neutral-200 tw-hidden tw-ml-2"
              @click="sortReverse(column)"
            >
              <i 
                class="tw-text-sm tw-text-neutral-500" 
                :class="`fa-solid fa-arrow-${column.asc ? 'up' : 'down'}-wide-short`"
              />
            </q-btn>
          </section>
          <!-- Body -->
          <section class="tw-flex tw-flex-col tw-gap-3.5">
            <section 
              v-for="row in tableData.rows" 
              class="
                tw-flex 
                tw-items-center 
                tw-min-h-12
                tw-font-medium
                rows
              " 
              :class="[
                {
                  'tw-justify-center': column?.align === 'center',
                  'tw-justify-end': column?.align === 'right',
                  'tw-justify-start': column?.align === 'left',
                }, 
                pickColor(row),
                column?.bodyClass,
              ]"
            >
              <!-- Chip -->
              <span
                v-if="column?.chip && !column?.progress"
                class="
                  tw-inline-flex
                  tw-items-center
                  tw-gap-1.5
                  tw-max-w-full
                  tw-px-3
                  tw-py-1
                  tw-rounded-full
                  tw-text-xs
                  tw-font-semibold
                  tw-leading-none
                  tw-whitespace-nowrap
                "
                :class="chipStyle(column, row).chipClass"
                :style="chipStyle(column, row).style"
              >
                <i v-if="chipStyle(column, row).icon" :class="chipStyle(column, row).icon" />
                <span class="tw-truncate">
                  {{ chipStyle(column, row).label }}
                </span>
                <q-tooltip>
                  {{ chipStyle(column, row).label }}
                </q-tooltip>
              </span>
              <span v-if="!column?.progress && !column?.chip" class="tw-truncate">
                {{ formatted(row[column.name], column?.format) }}
              </span>
              <q-tooltip v-if="!column?.progress && !column?.chip">
                {{ formatted(row[column.name], column?.format) }}
              </q-tooltip>
              <q-linear-progress
                v-if="column?.progress"
                size="22px" 
                :value="row[column.name]" 
                :color="column.progress.barColor"
                class="tw-rounded-full"
              >
                <div 
                  v-if="column.progress?.badge" 
                  class="absolute-full flex flex-center"
                >
                  <q-badge 
                    :color="column.progress.badge.bgColor || 'white'" 
                    :text-color="column.progress.badge?.textColor || 'black'" 
                    :label="formatPercentage(row[column.name])" 
                  />
                </div>
              </q-linear-progress>
            </section>
          </section>
        </div>
      </div>
    </div>
  </card-container>
</template>
<style scoped>

.tableContainer::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.tableContainer::-webkit-scrollbar-track {
  margin: 38px 0 0;
}

.table > div:first-child > .show-filter-hover {
  @apply tw-pl-5;
}

.table > div:first-child > section > .rows {
  @apply tw-rounded-l-2xl tw-pl-5;
}

.table > div:last-child > .show-filter-hover {
  @apply tw-pr-5;
}

.table > div:last-child > section > .rows {
  @apply tw-rounded-r-2xl tw-pr-5;
}

.show-filter-hover:hover > button {
  display: inline-flex;
}
</style>