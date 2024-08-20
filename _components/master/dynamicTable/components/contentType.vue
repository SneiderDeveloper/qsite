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
      :data="data"
    />
    <!-- default content -->
    <div v-if="!isComponent" v-show="!isLoading" class="ellipsis" v-html="deleteHtml(data)" ></div>
    <q-skeleton v-if="isLoading" animated type="text" />
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from 'modules/qsite/_components/master/dynamicTable/controllers/contentTypeController'

export default defineComponent({
  props: {
    col: {default: []},
    row: {default: []}
  },
  setup(props, {emit}) {
    return controller(props, emit)
  },
  computed: {
    deleteHtml() {
      return data => {
        if (!data) return '';
        return typeof data === 'string' ?
          data.replace(/<[^>]+>/g, '') :
          data;
      };
    },
  }
})
</script>
<style lang="scss">
</style>