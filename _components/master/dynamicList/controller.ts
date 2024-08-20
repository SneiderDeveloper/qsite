import {computed, reactive, ref, onMounted, toRefs, watch, getCurrentInstance} from "vue";

import services from "modules/qsite/_components/master/dynamicList/services";
import { store, i18n, clone } from 'src/plugins/utils';

export default function controller(props: any, emit: any) {
  const proxy = getCurrentInstance()!.appContext.config.globalProperties

  // Refs
  const refs = {
    // refKey: ref(defaultValue)
    //crudComponent: ref('crudComponent')
  }

  // States
  const state = reactive({
    // Key: Default Value
    loading: false,
    columns: [],
    rows: [],
    loadPageActions: false,
    requestParams: {}, 
    showModal: false, 
    expiresIn: null,     
    /* dynamicFilter */
    showDynamicFilterModal: false,
    dynamicFilterValues: {},
    dynamicFilterSummary: {},
    /* dynamicFilter */
    pagination: {
      page: 1,
      rowsNumber: '',
      rowsPerPage: 10,
      descending: true, 
      //sortBy: 'desc',
    },
  })

  // Computed
  const computeds = {
    // key: computed(() => {})
    
    hasPermission: computed(() => {
      //Default permission
      return  {
        create: props.listData?.permission ? store.hasAccess(`${props.listData?.permission}.create`) : true,
        index: props.listData?.permission ? store.hasAccess(`${props.listData?.permission}.index`) : true,
        edit: props.listData?.permission ? store.hasAccess(`${props.listData?.permission}.edit`) : true,
        destroy: props.listData?.permission ? store.hasAccess(`${props.listData?.permission}.destroy`) : true
      };
    }), 
    beforeUpdate: computed(() => props.listData?.beforeUpdate || false),
    title: computed(() => props?.listData?.read.title || false),
    help: computed(() => props?.listData?.read.help || false),
    actions: computed(() => props?.listData?.actions || false),
    tableProps: computed(() => props?.listData?.read?.tableProps || null),
    tableActions: computed(() => {
      //Default response
      let response = []      
      //Add search action
      if (props.listData.read.search !== false) response.push('search')      
      //Add create action
      if (props.listData.create && computeds.hasPermission.value['create']) {
       response.push('new')
      }     
      // extras for page action
      if (props.listData?.extraActions?.length > 0) response.push(...props.listData.extraActions)
      return response.filter((item) => !item.vIfAction)      
    }),

    dynamicFilter: computed(() =>  {
      if (props.listData.read?.filters) {
        if (Object.keys(props.listData.read?.filters).length > 0) {
          return props.listData.read?.filters;
        }
      }
      return {};
    }),

    systemName: computed(() => {
      return props.listData.read?.systemName || props.listData?.permission || props.listData?.entityName;
    }),

  }
  
  // Methods
  const methods = {
    // methodKey: () => {}
    async init(){
      await methods.setPageActions()
      await methods.setColumns()

      if(!dynamicFilter){
        methods.getData({pagination: {page: 1}}, true)
      }      
    },
    setPageActions(){      
      if(props.listData?.read.filters){
        state.loadPageActions = true
      }
    },
    search(val){      
      if(val){        
        state.requestParams.filter = {search: val} 
      } else {
        state.requestParams = {...props.listData.read.requestParams}
      }
      state.requestParams['filter'] = {...state.requestParams['filter'], ...state.dynamicFilterValues}
      state.pagination.page = 1
      state.pagination.take = 10
      methods.getData()
    },
    setColumns(){
      state.columns = props.listData.read.columns      
      //set isEditable
      state.columns.forEach(col => {
        col['isEditable'] = computeds.hasPermission.value['edit'] && col.hasOwnProperty('dynamicField')
      });      
    },

    setPagination(pagination){
      const getData = pagination.rowsPerPage > state.pagination.rowsNumber
      state.pagination = {...state.pagination, ...pagination}
      if(getData) methods.getData()
    },
    
    async getData(pagination = false, refresh = false){  
      //get include: 
      if(props.listData.read?.requestParams?.include ) state.requestParams.include = props.listData.read.requestParams.include 
      //get filters:
      state.requestParams.filter = {...state.requestParams?.filter || {}, ...props.listData.read?.requestParams?.filter || {}, ...state.dynamicFilterValues}
      
      state.requestParams['page'] = pagination?.page || state.pagination.page
      state.requestParams['take'] = state.pagination.rowsPerPage

      //Set order by      
      let sortBy = state.pagination?.sortBy || 'id';
      state.requestParams.filter.order = {
        field: sortBy,
        way: (state.pagination.descending != undefined) ? (state.pagination.descending ? 'desc' : 'asc') : 'desc'
      };      

      state.loading = true
      services.getData(props.listData.apiRoute, refresh,  state.requestParams).then((response) => {
        state.expiresIn = response?.expiresIn;
        if(response?.data){
          state.rows = response.data
          state.loading = false

          state.pagination.page = clone(response?.meta.page.currentPage);
          state.pagination.rowsNumber = clone(response?.meta.page.total);
          state.pagination.rowsPerPage = clone(state.pagination.rowsPerPage);
          //state.pagination.sortBy = clone(state.pagination.sortBy);
          state.pagination.descending = clone(state.pagination.descending);          
          emit('dataLoaded', response.data)
        }
      })
    },
    updateRow(row){
      //state.loading = true
      const foundIndex = state.rows.findIndex(r => r.id == row.id);
      state.rows[foundIndex]['isLoading'] = true

      services.updateItem(props.listData.apiRoute, row.id, row).then((response) => {
        
        if(response?.data){
          const requestParams = props.listData.read?.requestParams ? {...props.listData.read.requestParams} : {}
            
          services.showItem(props.listData.apiRoute, row.id, {params: requestParams}).then((response) => {            
            state.rows[foundIndex] = response.data
            state.rows[foundIndex]['isLoading'] = false
          })
          //state.loading = false
          emit('updatedRow', response.data)
        }
      })
    },
    toggleDynamicFilterModal() {
      state.showDynamicFilterModal = !state.showDynamicFilterModal;
    },
    updateFilter(key, value){
      state.dynamicFilterValues[key] = value;
    },
    updateDynamicFilterValues(filters) {      
      state.dynamicFilterValues = filters;
      state.requestParams.filter = state.dynamicFilterValues
      state.pagination.page = 1
      methods.getData();
    },
  }

  // Mounted
  onMounted(() => {
    methods.init()
  })

  // Watch
  // watch(key, (newField, oldField): void => {
  //
  // }, {deep: true})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
