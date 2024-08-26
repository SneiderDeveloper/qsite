<template>
  <div id="pageActionscomponent" class="row q-col-gutter-y-sm full-width items-center justify-between">
    <!--Title-->
    <div :class="`row text-primary text-weight-bold ellipsis title-content items-center`">
      <q-icon v-if="icon" :name="icon" size="22px" class="q-mr-sm" />
      <label id="titleCrudTable" v-if="title">{{ title }}</label>
      <!--Help Text: Page documentation-->
      <help-text v-if="pageDocumentation && title" v-bind="pageDocumentation" />
    </div>
    <!--Actions-->
    <div :class="`actions-content row q-gutter-${gutter} items-center justify-end items-start`">
      <!--Search-->
      <q-input v-model="search" bg-color="white" debounce="800" rounded outlined dense clearable
               :placeholder="$tr('isite.cms.label.search')" class="page-input-search"
               v-if="extraActions && extraActions.includes('search') && searchAction"
               @update:modelValue="$emit('search', $clone(search))">
        <template v-slot:prepend>
          <q-icon color="tertiary" size="xs" name="fa-light fa-magnifying-glass" />
        </template>
      </q-input>
      <!--Button Actions-->
      <div v-for="(btn, keyAction) in actions" :key="keyAction">
        <!-- if the button is dropdown -->
        <q-btn-dropdown
          v-bind="{...buttonProps}"
          v-if="btn.type == 'btn-dropdown'"
          class="btn-border-dropdown-custom"
          :label="btn.props.label"
          :icon="btn.props.icon"
        >
          <q-list>
            <q-item v-for="(item, index) in btn.items" :key="index" clickable v-close-popup
                    @click="item.action != undefined ? item.action() : null" class="tw-px-4">
              <q-item-section avatar v-if="item.icon">
                <q-avatar :icon="item.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn v-else-if="btn.type === 'recommendation'" class="animated" v-bind="{...buttonProps, ...btn.props}"
               @click="btn.action !=    undefined ? btn.action() : null">
          <q-tooltip v-if="btn.label">{{ btn.label }}</q-tooltip>
        </q-btn>
        <q-btn v-else v-bind="{...buttonProps, ...btn.props}" @click="btn.action != undefined ? btn.action() : null">
          <q-badge v-if="btn?.badge?.vIf" v-bind="{...btn?.badge }" />
          <q-tooltip v-if="btn.label && btn.badge?.show" v-model="showExpires" class="tw-z-10">{{ btn.label }}</q-tooltip>
          <q-tooltip v-else-if="btn.label">{{ btn.label }}</q-tooltip>
        </q-btn>
      </div>
    </div>
    <!--Description-->
    <span
      v-if="description"
      class="col-12 description-content"
    >
      {{ description }}
    </span>
    <!-- Export Component -->
    <master-export
      v-model="exportParams"
      ref="exportComponent"
      :dynamicFilterValues="dynamicFilterValues"
      :dynamicFilterSummary="dynamicFilterSummary"
    />
    <bulk-actions
      v-if="bulkActionsPermission"
      :dynamicFilterValues="dynamicFilterValues"
      :dynamicFilterSummary="dynamicFilterSummary"
      @bulkActionsConfig="(value) => bulkActionsConfig = value"
      ref="bulkActions"
    />
    <!-- Master Filter Component -->
    <!--<master-filter
      v-if="filter.load"
      :show="drawer.filter"
    />-->
    <master-synchronizable
      v-model="syncParams"
      v-if="$hasAccess('isite.synchronizables.index')"
      ref="syncComponent"
    />
  </div>
</template>
<script>
//Components
import masterExport from 'modules/qsite/_components/master/masterExport';
import masterSynchronizable from 'modules/qsite/_components/master/masterSynchronizable';
//import masterFilter from 'modules/qsite/_components/master/masterFilter';
import { eventBus } from 'src/plugins/utils';
import appConfig from 'src/setup/app'
import bulkActions from "modules/qsite/_components/master/bulkActions"

export default {
  beforeUnmount() {
    this.clearInterval();
    eventBus.off('page.data.filter.read');
  },
  props: {
    title: { type: String },
    description: { type: String },
    icon: { type: String },
    gutter: { type: String, default: 'sm' },
    size: { type: String, default: 'small' },
    extraActions: { type: Array },
    excludeActions: { default: false },
    searchAction: { default: true },
    multipleRefresh: {
      type: Boolean,
      default: () => false
    },
    tourName: { default: null },
    help: {
      required: false,
      type: Object,
      default: () => {
      }
    },
    expiresIn: {type: Number},
    dynamicFilter: {
      required: false,
      type: Object,
      default: () => {
        return {}
      }
    },
    dynamicFilterValues: {
      required: false,
      type: Object,
      default: () => {
        return {}
      }
    },
    dynamicFilterSummary: {
      required: false,
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  emits: ['search', 'new', 'refresh', 'toggleDynamicFilterModal', 'activateTour'],
  /*
  inject: {
    filterPlugin: {
      from: 'filterPlugin',
      default: {
        name: false,
        fields: {},
        values: {},
        callBack: false,
        pagination: {},
        load: false,
        hasValues: false,
        storeFilter: false
      }
    }
  },
  */
  components: { masterExport, masterSynchronizable, bulkActions },
  mounted() {
    this.$nextTick(function() {
      this.init();
    });
  },
  data() {
    return {
      exportParams: false,
      syncParams: false,
      search: null,
      filterData: {},
      refreshIntervalId: null,
      titleRefresh: this.$tr('isite.cms.label.refreshAtOnce'),
      timeRefresh: 0,
      drawer: {
        filter: false
      },
      showExpires: false,
      badgeAppear: false,
      timeOuts: [],
      bulkActionsConfig: false,
      enableTourAction: false
    };
  },
  watch: {
    expiresIn(newValue) {
      this.timeOuts.forEach(timeId => clearTimeout(timeId))
      this.showBadgeRefresh(newValue)
    }
  },
  computed: {
    isAppOffline() {
      return this.$store.state.qofflineMaster.isAppOffline;
    },
    //Return filter data
    filter() {
      this.filterData = this.$clone(this.filterPlugin.values);
      return this.filterPlugin;
      //this.filterData = this.$clone(this.$filter.values)
      //return this.$filter
    },
    //Return params of subHeader
    params() {
      return this.$clone(this.$route.meta.subHeader || {});
    },
    //Button default props
    buttonProps() {
      return {
        round: false,
        rounded: true,
        dense: true,
        unelevated: true,
        textColor: 'primary',
        style: 'border: 1px solid rgba(0, 13, 71, 0.15)',
        class: `btn-${this.size}`,
        noCaps: true
      };
    },
    //Page Actions
    actions() {
      //Instance excludeActions prop
      let excludeActions = this.$clone(Array.isArray(this.excludeActions) ? this.excludeActions : []);

      let response = [
        //Export Icommerce
        {
          label: this.$tr('isite.cms.label.migration'),
          vIf: (this.syncParams && !excludeActions.includes('sync')),
          props: {
            icon: 'fa-light fa-folder-tree'
          },
          action: () => this.$refs.syncComponent.show()
        },
        //Export
        {
          label: this.$tr('isite.cms.label.export'),
          vIf: (this.exportParams && !excludeActions.includes('export')) && !this.isAppOffline,
          props: {
            icon: 'fa-light fa-file-arrow-down'
          },
          action: () => this.$refs.exportComponent.showReport()
        },
        // Bulk Actions
        {
          label: this.$tr('isite.cms.label.newBulkAction'),
          vIf: this.bulkActionsPermission && this.bulkActionsConfig && !this.isAppOffline,
          props: {
            icon: 'fa-light fa-boxes-packing'
          },
          action: () => this.$refs.bulkActions.showReport()
        },
        //Tour
        {
          label: 'Tour',
          vIf: this.enableTourAction,
          props: {
            icon: 'fa-light fa-shoe-prints',
            id: 'actionStartTour'
          },
          action: () => this.startTour(true)
        },
        //recommendations
        {
          type: 'recommendation',
          label: this.$trp('isite.cms.label.recommendation'),
          vIf: (this.params.recommendations && !excludeActions.includes('recommendations')) ? true : false,
          props: {
            icon: 'fas fa-hat-wizard'
          },
          action: () => eventBus.emit('toggleMasterDrawer', 'recommendation')
        },
        //Filter
        {
          label: this.$tr('isite.cms.label.filter'),
          vIf: ( Object.keys(this.dynamicFilter).length && !excludeActions.includes('filter') && !this.isAppOffline),
          props: {
            icon: 'fa-light fa-filter',
            id: 'filter-button-crud'
          },
          action: () => this.$emit('toggleDynamicFilterModal')
        },

        //Refresh
        {
          label: !!this.expiresIn ? this.$tr('isite.cms.dateCache', { date: this.getDiffCacheTime() }) : this.$trp('isite.cms.label.refresh'),
          type: this.multipleRefresh ? 'btn-dropdown' : '',
          vIf: (this.params.refresh && !excludeActions.includes('refresh') && !this.isAppOffline),
          props: {
            icon: 'fa-light fa-rotate-right',
            id: 'refresh-button-crud'
          },
          badge: {
            vIf: (!!this.expiresIn && this.badgeAppear),
            floating: true,
            color: 'warning',
            rounded: true,
            show: true
          },
          items: [
            {
              label: this.$tr('isite.cms.label.refreshAtOnce'),
              action: () => this.refreshByTime(0)
            },
            {
              label: this.$tr('isite.cms.label.refreshEveryMinutes', { min: 1 }),
              action: () => this.refreshByTime(1)
            },
            {
              label: this.$tr('isite.cms.label.refreshEveryMinutes', { min: 5 }),
              action: () => this.refreshByTime(5)
            },
            {
              label: this.$tr('isite.cms.label.refreshEveryMinutes', { min: 10 }),
              action: () => this.refreshByTime(10)
            },
            {
              label: this.$tr('isite.cms.label.refreshEveryMinutes', { min: 15 }),
              action: () => this.refreshByTime(15)
            }
          ],
          action: () => this.emitRefresh()
        }
      ];

      //Validate extra actions
      if (this.extraActions) {
        //Prepend actions
        response = [...this.extraActions.filter(action => typeof action != 'string'), ...response];
        //New button action
        if (this.extraActions.includes('new'))
          response.unshift({
            vIf: this.params.create && this.params.hasPermission.create,
            props: {
              label: this.$tr(`isite.cms.label.new`),
              icon: 'fa-light fa-plus',
              textColor: 'primary',
              round: false,
              rounded: true,
              padding: '5px 15px',
              id: 'new-button-crud'
            },
            action: () => this.$emit('new')
          });
      }

      //force styles
      response = response.map(item => ({ ...item, props: { ...(item.props.label ? { padding: '5px 15px' } : {}), ...item.props, color: 'white', outline: false } }));

      //Response
      return response.filter(item => item.vIf !== undefined ? item.vIf : true);
    },
    //Quick filters
    quickFilters() {
      var response = {};
      //Get quick filters
      if (this.$q.platform.is.desktop) {
        if (this.filter.fields) {
          Object.keys(this.filter.fields).forEach(fieldName => {
            var fieldfilter = this.filter.fields[fieldName];
            if (fieldfilter.quickFilter) {
              response[fieldName] = {
                ...fieldfilter,
                colClass: 'col-12 col-md-4 col-xl-3'
              };
              if (!this.filterData[fieldName]) this.filterData[fieldName] = (fieldfilter.value || null);
            }
          });
        }
      }
      //Response
      return response;
    },
    //Page Documentation
    pageDocumentation() {
      //crud's help
      if (this.help?.title && this.help?.description) {
        return {
          title: this.help.title,
          description: this.help.description,
          icon: this.help?.icon || this.$route.meta.icon,
          class: this.help?.class || 'q-ml-sm'
        };
      }

      let response = null;
      //Get params from page permission
      let params = this.$helper.getInfoFromPermission(this.$route.meta.permission);
      if (params) {
        //instance the config name
        let configName = `${params.module}.documentation.${params.entity}`;
        //Search the config
        response = this.$store.getters['qsiteApp/getConfigApp'](configName);
      }

      if (response) {
        return {
          title: this.title,
          description: response,
          icon: this.$route.meta.icon,
          class: 'q-ml-sm'
        };
      }
      return false;
    },
    bulkActionsPermission() {
      const routeParams = this.$helper.getInfoFromPermission(this.$route.meta?.permission)
      const bulkActionsPermission = `${routeParams?.module}.${routeParams?.entity}.bulk-actions`
      return this.$hasAccess(bulkActionsPermission)
    }
  },
  methods: {
    init() {
      this.showBadgeRefresh(this.expiresIn)
      this.validateEnableTour();
    },
    async validateEnableTour() {
      if(this.tourName && !config('app.disableTours') &&
        (this.$store.getters['qsiteApp/getConfigApp']('igamification') != undefined)){
        let tour = await this.$tour.getTourData(this.tourName, true)
        if(tour) { 
          this.enableTourAction = true
          this.$emit('activateTour');
        }
      }
    },
    refreshByTime(time) {
      this.timeRefresh = time;
      this.titleRefresh = time === 0
        ? this.$tr('isite.cms.label.refreshAtOnce')
        : this.$tr('isite.cms.label.refreshEveryMinutes', { min: time });
      this.clearInterval();
      const interval = 1000 * 60 * time;
      this.emitRefresh();
      if (time > 0) {
        this.refreshIntervalId = setInterval(() => {
          this.emitRefresh();
        }, interval);
      }
    },
    //Emit refresh
    emitRefresh() {
      this.$emit('refresh');
      eventBus.emit('page.data.refresh');
      eventBus.emit('crud.data.refresh');
      eventBus.emit('export.data.refresh');
      this.badgeAppear = false
    },
    //Emit filter
    emitFilter() {
      this.filterPlugin.addValues(this.filterData);
      if (this.filterPlugin && this.filterPlugin.callBack) this.filterPlugin.callBack();
    },
    clearInterval() {
      if (this.refreshIntervalId) {
        clearInterval(this.refreshIntervalId);
        this.refreshIntervalId = null;
      }
    },
    //Handle start tour
    startTour(forceStart) {
      this.$tour.start(this.tourName, {
        forceStart,
        extraSteps: [
          {
            icon: 'fa-duotone fa-shoe-prints',
            title: this.$tr('igamification.cms.activities.repeatAction'),
            content: this.$tr('igamification.cms.activities.repeatActionDescription'),
            element: '#actionStartTour',
            position: 'top'
          }
        ]
      });
    },
    toggleMasterFilter(value) {
      this.drawer.filter = value;
    },
    getDiffCacheTime() {
      // Helper function to add a leading zero if the number is less than 10
      const addZero = (num) => num < 10 ? `0${num}` : num;
      const diffCache = this.expiresIn - appConfig.cacheTime
      const cacheDate = new Date(diffCache * 1000);
      const hours = cacheDate.getHours() > 12 ? cacheDate.getHours() - 12 : cacheDate.getHours();
      const minutes = cacheDate.getMinutes();
      const ampm = cacheDate.getHours() >= 12 ? 'pm' : 'am';
      // Formatear la fecha en formato dd/mm/yyyy
      const day = cacheDate.getDate();
      const month = cacheDate.getMonth() + 1;
      const year = cacheDate.getFullYear();
      return `${addZero(hours)}:${addZero(minutes)}${ampm}, ${addZero(day)}/${addZero(month)}/${year}`
    },
    //Show badge
    showBadgeRefresh(expires) {
      if (expires) {
        this.showExpires = true
        //Disappear in 7sec
        this.timeOuts.push(setTimeout(() => {
          this.showExpires = false
        }, 7000));
        const diffCache = expires - appConfig.cacheTime

        const cacheDate = diffCache * 1000;
        const currentTimeMillis = Date.now();
        // Calculate the difference in milliseconds
        const timeDifferenceMillis = currentTimeMillis - cacheDate;
        // Check if 15 minutes have passed
        const fifteenMinutesInMillis = 15 * 60 * 1000;
        if (timeDifferenceMillis >= fifteenMinutesInMillis) {
          this.badgeAppear = true
        } else {
          this.badgeAppear = false
          const timeToAppear = fifteenMinutesInMillis - timeDifferenceMillis
          //Appear bagde
          this.timeOuts.push(setTimeout(() => {
            this.badgeAppear = true
          }, timeToAppear));
        }
      }
    }
  }
};
</script>
<style lang="scss">
#pageActionscomponent {
  #titleCrudTable {
    font-size: 20px;
  }

  .animated {
    animation: ring 10s .7s ease-in-out infinite;
  }

  .title-content {
    @media screen and (max-width: $breakpoint-md) {
      text-align: center;
      width: 100%;
    }
  }

  .actions-content {
    .q-btn--dense > .q-btn__content:not(:has(.block)):not(:has(.text-center)) {
      padding: 0.285rem;
    }

    .q-field {
      padding-bottom: 0 !important;
    }

    .q-field__append .q-icon {
      color: $tertiary;
    }

    @media screen and (max-width: $breakpoint-md) {
      width: 100%;
    }
  }

  .description-content {
    line-height: 1;
    color: $grey-8;
    font-size: 14px;
  }

  .page-input-search {
    @media screen and (max-width: $breakpoint-md) {
      width: 100%;
    }

    .q-field__control, .q-field__control:after, .q-field__control-container, .q-field__append {
      //min-height: 34px;
      //max-height: 34px;
    }

    .q-field__control, .q-field__prepend, .q-field__append {
      height: 34px;
    }
  }

  #dynamicFieldComponent {
    .q-field.q-field--float .q-field__label {
      color: $primary;
    }

    .q-field__control {
      .q-field__append .q-icon {
        color: $tertiary;
      }

      .q-field__append:last-child .q-icon {
        color: $primary;
      }
    }
  }

  .q-menu {
    .q-list {
      .q-item {
        padding: 3px 10px 3px 3px;

        .q-item__section--avatar {
          min-width: 50px;
          padding-right: 10px;
          color: $primary;

          i {
            font-size: 16px;
          }
        }
      }
    }
  }

  @keyframes ring {
    0% {
      transform: rotate(0);
    }
    1% {
      transform: rotate(30deg);
    }
    3% {
      transform: rotate(-28deg);
    }
    5% {
      transform: rotate(34deg);
    }
    7% {
      transform: rotate(-32deg);
    }
    9% {
      transform: rotate(30deg);
    }
    11% {
      transform: rotate(-28deg);
    }
    13% {
      transform: rotate(26deg);
    }
    15% {
      transform: rotate(-24deg);
    }
    17% {
      transform: rotate(22deg);
    }
    19% {
      transform: rotate(-20deg);
    }
    21% {
      transform: rotate(18deg);
    }
    23% {
      transform: rotate(-16deg);
    }
    25% {
      transform: rotate(14deg);
    }
    27% {
      transform: rotate(-12deg);
    }
    29% {
      transform: rotate(10deg);
    }
    31% {
      transform: rotate(-8deg);
    }
    33% {
      transform: rotate(6deg);
    }
    35% {
      transform: rotate(-4deg);
    }
    37% {
      transform: rotate(2deg);
    }
    39% {
      transform: rotate(-1deg);
    }
    41% {
      transform: rotate(1deg);
    }
    43% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(0);
    }
  }
}
</style>
