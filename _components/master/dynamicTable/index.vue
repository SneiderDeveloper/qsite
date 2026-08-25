<template>
  <div id="dynamic-table">
    <q-table
      v-bind="tableProps"
      :title="title"
      :loading="loading"
      :rows="rows"
      :columns="columns"
      row-key="name"
      v-model:pagination="paginationModel"
      hide-pagination
      :visible-columns="getVisibleColumns()"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>
      <template v-slot:header="props" v-if="hasBeforeRowsSlot">
        <q-tr>
          <q-th
            key="beforeRows"
            :colspan="props.cols.length - 1"
          >
            <slot name="before-rows" />
          </q-th>
        </q-tr>
        <q-tr>
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <!---right click --->
          <contextMenu
            :v-if="actions && actions.length"
            :actions="filterActions(actions, props.row)"
            :action-data="props.row"
          />

          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :class="getCellClass(col, props.row)"
            @click="onClick(col, props.row)"
          >
            <!-- Keep this to allow unique elements-->
            <div :key="$uid()">
              <!---quick click edit popup-->
              <editablePopup
                v-if="!isColActions(col) && isColEditable(col, props.row)"
                :row="props.row"
                :col="col"
                :beforeUpdate="beforeUpdate"
                @updateRow="(row) => $emit('updateRow', row)"
              />

              <!--Actions column-->
              <div v-if="isColActions(col) && actions.length">
                <btn-menu
                  :actions="filterActions(actions, props.row)"
                  :action-data="props.row"
                />
              </div>

              <!-- dynamic content  -->
              <contentType
                v-if="!isColActions(col)"
                :col="col"
                :row="props.row"
                :val="col.value"
              />
            </div>
          </q-td>
        </q-tr>
        <slot name="after-rows" v-if="hasAfterRowsSlot && (props.rowIndex === rows.length - 1)"/>
      </template>
      <!-- pagination -->
      <template #bottom="props">
        <!--pagination-->
        <master-pagination
          v-if="paginationModel.rowsNumber"
          v-model="paginationModel"
          :pagesNumber="props.pagesNumber"
          :isFirstPage="props.isFirstPage"
          :isLastPage="props.isLastPage"
          @update:modelValue="(val) => $emit('onPagination', val)"
          class="
            tw-mt-[16px]
            tw-px-[12px]
            tw-px-[15px]
          "
        />
      </template>

      <template #pagination="props">
        <p>bottom table</p>
      </template>
      <template #no-data="props" v-if="hasNoDataSlot">
        <slot name="no-data" />
      </template>

    </q-table>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import controller from 'modules/qsite/_components/master/dynamicTable/controller';
import editablePopup from 'modules/qsite/_components/master/editablePopup';
import contentType from 'modules/qsite/_components/master/contentType';
import contextMenu from 'modules/qsite/_components/master/contextMenu';
import masterPagination from 'modules/qsite/_components/master/masterPagination';


export default defineComponent({
  props: {
    tableProps: { default: null },
    loading: { default: false },
    title: { default: '' },
    columns: { default: [] },
    rows: { default: [] },
    actions: { default: [] },
    pagination: { default: [] },
    beforeUpdate: {
        type: Function as PropType<() => void | null | boolean>,
        required: false,
        default: null,
    },
    visibleColumns: { default: [] }
  },
  components: {
    editablePopup,
    contextMenu,
    contentType,
    masterPagination
  },
  setup (props, { emit })
  {
    return controller(props, emit);
  },
  computed: {},
  methods: {}
});
</script>
<style lang="scss">
#dynamic-table {

  .q-table {
    padding-bottom: 16px;
  }

  .q-table__top, .q-table__middle, .q-table__bottom {
    border-radius: $custom-radius;
    //box-shadow: $custom-box-shadow;
  }

  th {
    color: $blue-grey;
    font-weight: bold;
    font-size: 13px !important;
  }

  //text-align: left !important;

  td {
    color: #222222;
  }


  .q-table__card {
    background-color: transparent !important;
    box-shadow: none !important;
  }

  .q-table th,
  .q-table td {
    border-color: $grey-2;
  }

  .q-table__middle {
    border-radius: $custom-radius;
    box-shadow: $custom-box-shadow;
    background-color: white;
  }

  .q-table__top {
    margin-bottom: 16px !important;
    padding: 12px 16px !important;
  }

  .q-table__middle {
    min-height: 0 !important;
    margin: 0 !important;
  }

  .q-table__bottom {
    border-top: 1px solid transparent !important;
    margin-top: 0px !important;
    padding: 0px !important;
    min-height: 0px !important;
    
  }

  .sticky-actions {
    background-color: white;
    position: sticky;
    left: 0;
    z-index: 1;
  }


  .default-card-grid {
    .default-card-grid_item-image {
      width: 100%;
      height: 140px;
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      border-radius: $custom-radius-items;
      margin: 10px 0 10px 0;
    }
  }

  #crudPaginationComponent {
    .q-btn {
      height: 30px;
      width: 30px;
      min-width: 30px !important;
    }
  }

  #collapseTable {
    padding: 0;
    background-color: $grey-1;

    #contentRelationData {
      min-height: 90px;
      position: relative;
      width: 100%;
    }

    .q-table, th:last-child, th:first-child, td:last-child, td:first-child {
      background-color: $grey-1;
    }

    .q-table__middle {
      padding: 0;
      box-shadow: none;
      border-radius: 0;
    }
  }

  #selectedRows {
    border-radius: $custom-radius;
  }
}
</style>
