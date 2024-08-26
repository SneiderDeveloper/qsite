<template>
  <!--cell content-->
  <div :style="col?.style">
    <!-- custom component -->  
    <component 
      v-if="component"
      v-show="!isLoading" 
      :is="component" 
      :col="col"
      :row="row"
      :val="val"
    />
    <!-- default content -->
    <div v-if="!isComponent" v-show="!isLoading" class="ellipsis" v-html="val" @click="onClick({val, col, row})"></div>
    <q-skeleton v-if="isLoading" animated type="text" />
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from 'modules/qsite/_components/master/dynamicTable/components/contentType/controller'

export default defineComponent({
  props: {
    col: {default: []},
    row: {default: []}
  },
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="scss">
</style>