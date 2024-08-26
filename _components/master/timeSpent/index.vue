<template>  
  <q-input
    @update:model-value="(value) => setTimeSpent(value)"
    v-model="timeSpent"
    v-bind="fieldProps.field"
    :label="label"
    :class="class"
    debounce="600"
    :clearable="fieldProps.field.clearable"
    @clear="() => clear()"
  >
  </q-input>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from 'modules/qsite/_components/master/timeSpent/controller'

export default defineComponent({
  props: {
    modelValue: '', 
    fieldProps: {},
    label: '',
    class: '',
  },
  //emits:['update:modelValue'],
  components: {},
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="scss">
</style>
