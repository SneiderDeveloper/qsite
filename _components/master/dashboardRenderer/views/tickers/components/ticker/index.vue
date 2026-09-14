<script lang="ts">
import { defineComponent } from 'vue'
import controller from './controller'

export default defineComponent({
  props: {
    apiRoute: {
      type: String,
      default: null
    },
    permission: {
      type: String,
      default: null
    },
    data: {
      type: Object,
      default: () => ({})
    },
    valueHidden: {
      type: Boolean,
      default: false
    }
  },
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<template>
  <div
    v-if="havePermission"
    class="
      tw-inline-flex 
      tw-flex-nowrap
      tw-gap-5
      tw-box-border
      tw-min-w-40
      tw-rounded-2xl 
      tw-p-5 
      tw-bg-gradient-to-br
      tw-from-white
      tw-from-45%
      tw-to-blue-50
    "
  >
    <section class="tw-flex tw-w-full tw-flex-col tw-gap-2 tw-justify-center" >
      <div>
        <div 
          v-if="ticker?.title" 
          class="tw-flex tw-items-center tw-text-gray-400 tw-w-full"
        >
          <q-skeleton 
            v-show="isLoading" 
            class="tw-w-14 tw-mb-1" 
            type="QBadge"
          />
          <div 
            v-show="!isLoading" 
            class="tw-text-xs tw-font-semibold tw-w-max"
            v-html="ticker.title"
          />
          <q-btn
            v-if="(valueHidden || ticker?.valueHidden) && !isLoading && (ticker.body.length === 1)"
            unelevated 
            size="xs" 
            class="tw-p-0 tw-ml-2"
            @click="hideValue"
            flat
          >
            <i 
              class="fa-regular tw-text-xs" 
              :class="{
                'fa-eye': isValueHidden,
                'fa-eye-slash': !isValueHidden
              }" 
            />
          </q-btn>
        </div>
        <section class="tw-flex tw-gap-2 tw-items-center tw-h-auto">
          <template v-for="(body, index) in ticker?.body" :key="index">
            <div 
              class="tw-flex tw-flex-col tw-justify-center" 
              :class="body?.className"
            >
              <div v-if="body?.title">
                <q-skeleton 
                  v-show="isLoading" 
                  class="tw-w-14 tw-mb-1" 
                  type="QBadge"
                />
                <div 
                  v-show="!isLoading" 
                  class="tw-text-gray-400 tw-text-xs tw-font-semibold tw-w-max"
                  v-html="body.title"
                />
              </div>
              <div v-if="body?.value">
                <q-skeleton 
                  v-show="isLoading" 
                  class="tw-w-20 tw-h-7" 
                  type="rect"
                />
                <div
                  v-if="showValue"
                  v-show="!isLoading"
                  class="tw-text-2xl tw-font-bold" 
                  v-html="body.value" 
                />
                <h1 
                  v-show="!isLoading && isValueHidden && valueHidden" 
                  class="tw-text-2xl"
                >
                  ********
                </h1>
              </div>
              <div v-if="body?.footer">
                <q-skeleton 
                  v-show="isLoading" 
                  class="tw-w-24" 
                  type="QBadge"
                />
                <div 
                  v-show="!isLoading"
                  class="tw-text-xs tw-w-max" 
                  v-html="body.footer" 
                />
              </div>
            </div>
            <hr class="tw-h-12 tw-w-px tw-bg-gray-200 hr-separator tw-mx-5"/>
          </template>
        </section>
      </div>
      <div v-if="ticker?.footer">
        <q-skeleton v-show="isLoading" class="tw-w-24" type="QBadge"/>
        <div 
          v-show="!isLoading"
          class="tw-text-xs tw-w-max" 
          v-html="ticker.footer" 
        />
      </div>
    </section>
    <div class="tw-grid tw-items-center tw-text-gray-400">
      <q-btn
        v-if="(valueHidden || ticker?.valueHidden) && !isLoading && (ticker.body.length > 1)"
        unelevated 
        size="xs" 
        class="tw-p-0 tw-mb-1"
        @click="hideValue"
        flat
      >
        <i 
          class="fa-regular tw-text-xs" 
          :class="{
            'fa-eye': isValueHidden,
            'fa-eye-slash': !isValueHidden
          }" 
        />
      </q-btn>
      <section
        v-if="ticker?.icon"
        class="tw-flex tw-items-center tw-text-2xl"
        :class="ticker.icon?.className"
      >
        <q-skeleton v-show="isLoading" class="tw-w-6 tw-h-6" type="circle"/>
        <i v-show="!isLoading" :class="ticker.icon?.name"></i>
      </section>
    </div>
  </div>
</template>
<style scoped>
.hr-separator:last-child {
  display: none;
}
</style>