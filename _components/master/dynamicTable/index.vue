<template>
  <div id="dynamic-table">
    <q-table      
      v-bind="tableProps"
      :title="title"
      :loading="loading"
      :rows="rows"
      :columns="columns"
      row-key="name"
      v-model:pagination="pagination"
      hide-pagination
      :pagination.sync="pagination"
      @request="() => {console.log('request')}"
    >    
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>      
      <template v-slot:body="props">
        <q-tr :props="props">
          <!---right click --->
          <contextMenu
            :actions="actions"
            :action-data="props.row"
          />

          <q-td
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :class="`${(col?.dynamicField || col?.onClick) && !props.row?.isLoading ? 'cursor-pointer' : ''}`"
          >
            <!---quick click edit popup-->
            <editablePopup 
              v-if="col.name != 'actions' && props.row[col.name] && col?.dynamicField && !props.row?.isLoading"
              :row="props.row"
              :col="col"
              :beforeUpdate="beforeUpdate"
              @updateRow="(row) => $emit('updateRow', row)"
            />

            <!--Actions column-->
            <div v-if="col.name == 'actions'">              
              <btn-menu
                :actions="actions"
                :action-data="props.row"
              />  
            </div>

            <!-- dynamic content  -->
            <contentType
              v-if="col.name != 'actions'"
              :col="col"
              :row="props.row"
            />            

            
          </q-td>
        </q-tr>
      </template>
      <!-- pagination -->
      <template #bottom="props">
        <!--pagination-->
        <div :class="`bottonCrud full-width flex items-center ${windowSize == 'mobile' ? 'justify-center' : 'justify-between'}`">
          <div class="sm:tw-text-sm":class="`text-blue-grey ${windowSize == 'mobile' ? 'q-mb-sm' : ''} `">
            {{ $tr('isite.cms.label.showing') }} <b>{{ countPage(props) }}</b> {{ $trp('isite.cms.label.entry') }}
          </div>
          <div class="col-12 q-ml-sm q-mr-lg flex flex-center">
            <q-pagination
              id="crudPaginationComponent"
              v-if="showPagination(props)"
              v-model="pagination.page"
              :value="props.pagination"
              @click.prevent="() => $emit('onPagination', pagination)"
              round
              input-class="no-shadow"
              color="while"
              text-color="primary"
              active-color="primary"
              active-text-color="white"
              :max="props.pagesNumber"
              :max-pages="6"
              :ellipses="false"
              :boundary-numbers="false"
              unelevated
            />      
          </div>
          <div class="flex items-center">
            <div class="flex items-center tw-mr-4 text-blue-grey">
              <span class="sm:tw-text-sm">{{ $tr('isite.cms.label.show') }}</span>
              <q-select
                v-model="pagination.rowsPerPage"
                :options="rowsPerPageOption"
                @update:modelValue="(val) => $emit('onPagination', pagination)"
                options-cover
                dense
                class="q-mx-sm text-caption"
                outlined
              />
              <span class="sm:tw-text-sm">{{ $trp('isite.cms.label.entry') }}</span>
            </div>
            <div class="actionsBtnPag">
              <q-btn
                color="primary"
                class="tw-mr-2"
                dense
                size="14px"
                round
                flat
                :disable="props.isFirstPage"
                @click="props.prevPage"
              >
                <i class="fa-solid fa-chevron-left"></i>
              </q-btn>
              <q-btn
                color="primary"
                dense
                size="14px"
                round
                flat
                :disable="props.isLastPage"
                @click="props.nextPage"
              >
                <i class="fa-solid fa-chevron-right"></i>
              </q-btn>
            </div>
          </div>
        </div>
      </template>
    </q-table>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from 'modules/qsite/_components/master/dynamicTable/controller'
import editablePopup from 'modules/qsite/_components/master/dynamicTable/components/editablePopup'
import contentType from 'modules/qsite/_components/master/dynamicTable/components/contentType'
import contextMenu from 'modules/qsite/_components/master/dynamicTable/components/contextMenu'


export default defineComponent({
  props: {
    tableProps: { default: null},
    loading: { default: false},
    title: { default: ''},
    columns: {default: []},
    rows: {default: []},
    actions: {default: []},
    initialPagination: {default: []},
    beforeUpdate: {        
      type: Function,
      default: () => {}
    }
  },
  components: {
    editablePopup,
    contextMenu, 
    contentType,
  },
  setup(props, {emit}) {
    return controller(props, emit)
  }, 
  computed: {
    windowSize() {
      return window.innerWidth >= '500' ? 'desktop' : 'mobile'
    },
  }, 
  methods: {
    showPagination(props) { 
      return this.windowSize == 'desktop' && props.pagesNumber > 1
    }
  },
})
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
      margin-top: 16px !important;
      padding: 12px 16px !important;
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
