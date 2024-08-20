<template>
  <div id="componentDynamicList">
    <!--Content-->
    <div id="backend-page">      
      <!--Page Actions-->      
      <div class="q-my-md">        
        <page-actions 
          v-if="loadPageActions"
          :extra-actions="tableActions"          
          :title="title" 
          :help="help"
          :expires-in="expiresIn"
          :dynamicFilter="dynamicFilter"
          :dynamicFilterValues="dynamicFilterValues"
          :dynamicFilterSummary="dynamicFilterSummary"
          @toggleDynamicFilterModal="toggleDynamicFilterModal"
          @new="() => {
            $refs.crudComponent.create()
          }"
          @search="val => search(val)"
          @refresh="getData({pagination: {page:1}}, true)"          
        />
        <crud          
          ref="crudComponent"
          :crud-data="crudData" 
          :type="null"
          @created="getData({page: 1}, true)"
          @deleted="getData({page: 1}, true)"
        />     
        <!-- dynamicFilter -->
        <dynamicFilter
          v-if="dynamicFilter"
          :systemName="systemName"
          :modelValue="showDynamicFilterModal"
          :filters="dynamicFilter"
          @showModal="showDynamicFilterModal = true"
          @hideModal="showDynamicFilterModal = false"
          @update:modelValue="filters => updateDynamicFilterValues(filters)"
          @update:summary="summary => dynamicFilterSummary = summary"
        />
        <!--table title-->
        <div v-if="!loadPageActions" :class="`row text-primary text-weight-bold ellipsis title-content items-center`">
          <label id="titleCrudTable" v-if="title">{{ title }}</label>          
        </div>
      
        <slot name="top-table" >
        </slot>
        <dynamicTable
          :tableProps="tableProps"
          :columns="columns"
          :rows="rows"
          :actions="actions"
          :initialPagination="pagination"
          :loading="loading"
          :beforeUpdate="beforeUpdate"
          @onPagination="(value) => setPagination(value)"
          @updateRow="(row) => updateRow(row)"
        />        
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent, toRaw} from 'vue'
import controller from 'modules/qsite/_components/master/dynamicList/controller'
import dynamicTable from 'modules/qsite/_components/master/dynamicTable'
import crudForm from 'modules/qcrud/_components/form';
import dynamicFilter from 'modules/qsite/_components/master/dynamicFilter';

export default defineComponent({
  props: {
    listData: {      
      apiRoute: { default: ''},
      title: { default: ''},
      columns: {default: []},
      actions: {default: []},
      permission: {default: ''}, 
      requestParams: {default: {}}, 
      filters: { default: {}},
      help: { default: {}},
      pageActions: {default: true},
      beforeUpdate: {        
        type: Function,
        default: () => {}
      }
    }
  },
  components: { dynamicTable, crudForm, dynamicFilter },
  setup(props, {emit}) {
    return controller(props, emit)
  }, 
  computed: {
    crudData(){
      return {        
        'default': {
          render() {},
          data() {
            return {
              crudId: this.$uid()
            }
          },
          computed: {            
            crudData: () => this.listData, 
            //Crud info
            crudInfo() {
              return this.$store.state.qcrudComponent.component[this.crudId] || {}
            }
          }
        }
      }      
    },    
    crud(){
      return this.$refs.crudComponent
    }
  }, 
  methods: {
  
  },
})
</script>
<style lang="scss">
#componentDynamicList {
  .btn-menu-offline {
    @apply tw-bg-yellow-400;
  }

  #backend-page {
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

    .stick-table {
      th:last-child, td:last-child {
        background-color: white;
        position: sticky;
        right: 0;
        z-index: 1;
      }

      th:first-child, td:first-child {
        background-color: white;
        position: sticky;
        left: 0;
        z-index: 1;
      }
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

  #dialogFilters {
    min-height: max-content !important;
  }

  #titleCrudTable {
    font-size: 20px;
  }
}
</style>
