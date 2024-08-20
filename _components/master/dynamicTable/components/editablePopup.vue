<template>
    <q-popup-edit
      v-if="col?.isEditable && col?.dynamicField || false"
      ref="popupEditRef"
      v-model="row[col.name]"
      v-slot="scope"              
      no-caps
      :cover="false"
      anchor="bottom start"
      transition-show="fade-in" 
      transition-hide="fade-out"
    >
    <q-form
      autocorrect="off"
      autocomplete="off"
      ref="formContent"
      @submit="runBeforeUpdate(scope)"
      @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))"
    >
      <p>Update {{ col.label }} Id: {{row.id}} </p>
      <div class="q-py-sm">
        <dynamic-field
          v-if="isSelectField"
          v-model="scope.value.id"
          :field="col['dynamicField']"
          :enableCache="true"
        />
        <dynamic-field v-else
          v-model="scope.value"
          :field="col['dynamicField']"
          :enableCache="true"
        />
        <div class="row justify-center q-gutter-sm">
          <q-btn
            label="Close"
            no-caps
            unelevated
            rounded            
            @click.stop.prevent="scope.cancel"
          />
          <q-btn
            label="Update"
            no-caps
            unelevated
            rounded
            @click="$refs.formContent.submit()"
            :disable="scope.validate(scope.value) === false || scope.initialValue === scope.value"
          />
        </div>
      </div>
      </q-form>
    </q-popup-edit>            
  </template>
  <script lang="ts">
  import {defineComponent} from 'vue'
  import controller from 'modules/qsite/_components/master/dynamicTable/controllers/editablePopupController'
  
  export default defineComponent({
    props: {    
      row: {type: Object, default: null},    
      col: {type: Object, default: null},
      beforeUpdate: {        
        type: Function,
        default: () => {}
      }
    },
    setup(props, {emit}) {
      return controller(props, emit)
    },
    components: {}
  })
  </script>
  <style lang="scss">
  </style>
  