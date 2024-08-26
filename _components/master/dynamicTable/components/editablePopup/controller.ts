import {computed, reactive, ref, onMounted, toRefs, watch, markRaw, shallowRef} from "vue";


export default function controller(props, emit) {  

  // Refs
  const refs = {
    // refKey: ref(defaultValue)    
  }

  // States
  const state = reactive({
    // Key: Default Value
    dynamicModel: null,    
  })

  // Computed
  const computeds = {
    // key: computed(() => {})
    maxWidth: computed(() => props.col.dynamicField?.maxWidth ? props.col.dynamicField.maxWidth : '300px' ),
    isSelectField: computed(() => props.col.dynamicField.type == 'select'), 
    fieldName: computed(() => props.col.dynamicField?.name ? props.col.dynamicField.name : props.col.name) //field to update
  }

  // Methods
  const methods = {
    // methodKey: () => {}
    async runBeforeUpdate(scope){      
      let response = true

      const val = computeds.isSelectField.value ? scope.value.id : scope.value //if selectField      
      const tempRow = {...props.row}      
      tempRow[computeds.fieldName.value] = val
      
      if(props.beforeUpdate){        
        await props.beforeUpdate({val, row: tempRow, col: props.col}).then((val) => {
          scope.set()
          emit('updateRow', tempRow)
        }).catch(error => {
          scope.value = scope.initialValue
          response = false
        })
      }
      return response
    }       
  }

  // Mounted
  onMounted(() => {    
  })

  // Watch
  // watch(key, (newField, oldField): void => {
  //
  // }, {deep: true})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
