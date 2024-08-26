<template>
  <q-menu
    touch-position
    context-menu
    max-width="200px"
    class="btn-menu-component__menu"
    anchor="bottom right"
    self="top right"
  > 
    <q-list dense separator>
      <template v-for="(action, key) in actions">
        <q-item                    
          v-bind="action.props"
          v-close-popup                    
          @click.native="runAction(action)"
        >
          <q-item-section>
            <div class="row items-center text-blue-grey">
              <q-icon :name="action.icon" color="blue-grey" size="16px" />
              &nbsp;
              {{ action.label || action.tooltip }}
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-menu>  
</template>
<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  props: {        
    actions: {default: []},
    actionData: {default: []},
  },
  methods: {
    //Call custom action
    async runAction(action) {
      //Define action params
      let actionData = this.$clone(this.actionData || {});
      //Check if has action function
      if (action.action) await action.action(actionData);
    },
  },
})
</script>
<style lang="scss">
</style>
