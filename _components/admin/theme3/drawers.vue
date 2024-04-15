<template>
  <div>
    <!-- MENU -->
    <q-drawer
      class="navMaster"
      v-model="drawer.menu" 
      ref="menuMaster"
      :mini="miniState" 
      @click.capture="miniState ? eventBus.emit('toggleMasterDrawer','menu') : null"
    >
      <!--Logo-->
      <div 
        v-show="!miniState"
        class="
          tw-p-7 
          tw-border-b 
          tw-border-gray-200
        "
      >
        <q-img 
          fit="contain" 
          :src="logo" 
          style="height: 64px; min-height: 64px"
        />
      </div>
      <div 
        v-if="miniState"
      >
        <!-- <q-img fit="contain" :src="minilogo"/> -->
        <q-btn 
          v-if="appConfig.mode === 'iadmin'" 
          icon="fas fa-bars" 
          unelevated
          class="text-primary buttonToogleMenuClose" 
          @click="toggleDrawer('menu')"
          />
      </div>
      <!--List iadmin-->
      <q-scroll-area 
        id="adminMenu" 
        class="tw-bg-white" 
        :style="`height: calc(100vh - 146px`"
      >
        <!--Menu-->
        <menu-list 
          ref="menuList" 
          group 
          :translatable="menuTranslatable" 
          :menu="menuSelect"
          :with-tooltip="miniState" 
          :tooltip-props="{anchor:'center right'}"
          class="
            tw-font-medium
            tw-text-gray-700
            tw-text-base
          "
        />
      </q-scroll-area>
    </q-drawer>

    <!-- Config -->
    <q-drawer 
      bordered id="configMaster" 
      overlay 
      v-model="drawer.config" side="right"
    >
      <config-list/>
    </q-drawer>

    <!-- Chat -->
    <q-drawer 
      bordered 
      id="chatMaster" 
      overlay 
      v-model="drawer.chat" 
      side="right"
      v-if="$hasAccess('ichat.conversations.index')"
    >
      <chat-list/>
    </q-drawer>

    <!--Recommendation-->
    <q-drawer 
      id="drawerRecommendationMaster" 
      v-model="drawer.recommendation" 
      side="right" 
      :overlay="false"
      v-if="routeSubHeader.recommendations ? true : false"
    >
      <master-recommendation/>
    </q-drawer>

    <!--Notification-->
    <q-drawer 
      bordered 
      id="dawerNotificatiosMaster" 
      v-model="drawer.notification" 
      side="right" 
      overlay
      v-if="$hasAccess('notification.notifications.manage')"
    >
      <master-notifications/>
    </q-drawer>

    <!--Offline-->
    <q-drawer
      class="tw-bg-gray-100"
      id="drawerOfflineMaster"
      v-model="drawer.offline"
      side="right"
      overlay
      v-if="offlineDrawer"
    >
      <offline/>
    </q-drawer>
  </div>
</template>
<script>
//mixins
import sidebarMixins from 'modules/qsite/_mixins/sidebarMixins'
//Components
import configList from 'modules/qsite/_components/master/configList'
import chatList from 'modules/qchat/_components/drawerChatList'
import menuList from 'modules/qsite/_components/master/recursiveItem'
import checkin from 'modules/qcheckin/_components/checkin'
import masterRecommendation from 'modules/qsite/_components/master/masterRecommendations'
import masterNotifications from 'modules/qnotification/_components/drawerNotifications'
import offline from 'modules/qoffline/_components/drawerOffline'
import { eventBus } from 'src/plugins/utils'

export default {
  beforeDestroy() {
    eventBus.off('toggleMasterDrawer')
    eventBus.off('openMasterDrawer')
  },
  mixins: [sidebarMixins],
  props: {},
  components: {
    menuList,
    configList,
    chatList,
    checkin,
    masterRecommendation,
    masterNotifications,
    offline
  },
  mounted() {
    this.$nextTick(function () {
      console.log('masterDrawers3 mounted')
      this.init()
    })
  },
  data() {
    return {
      windowHeight: window.innerHeight,
      windowWith: window.innerWidth,
      projectName: this.$getSetting('core::site-name'),
      logo: this.$store.state.qsiteApp.logo,
      miniState: this.windowSize == 'mobile' ? false : true,
      drawer: {
        menu: false,
        config: false,
        chat: false,
        checkin: false,
        recommendation: false,
        notification: false,
        offline: false
      },
      appConfig: config('app'),
      eventBus
    }
  },
  computed: {
    offlineDrawer() {
      return this.$getSetting('isite::offline')
    },
    windowSize() {
      return this.windowWith >= '992' ? 'desktop' : 'mobile'
    },
    primaryContrast() {
      return this.$getSetting('isite::primaryContrast')
    },
    secondaryContrast() {
      return this.$getSetting('isite::secondaryContrast')
    },
    minilogo() {
      return this.$store.getters['qsiteApp/getSettingMediaByName']('isite::logoIadminSM')['path']
    },
    routeSubHeader() {
      this.drawer.recommendation = false
      return this.$route.meta.subHeader || {}
    },
    //Version app text
    versionText() {
      return 'v' + config('app.version')
    },
    openMenu: {
      get() {
        return this.drawer.menu
      },
      set(value) {
        this.drawer.menu = value;
      }
    },
  },
  methods: {
    //init
    init() {
      this.handlerEvent()
      // this.contrast()
      //Watch window size
      window.addEventListener('resize', () => {
        this.windowHeight = window.innerHeight
        this.windowWith = window.innerWidth
      })
      this.openMenu = this.windowSize == 'mobile' ? false : true;
    },
    //contrast color alter
    // contrast() {
    //   const master = document.querySelector('#masterDrawers2')
    //   if (!master) return '#000000';
    //   const bgColor = getComputedStyle(master).getPropertyValue('--q-color-primary')
    //   const contrast = this.$helper.pickTextColor(bgColor)
    //   const bgColor2 = getComputedStyle(master).getPropertyValue('--q-color-secondary')
    //   const contrast2 = this.$helper.pickTextColor(bgColor2)
    //   this.primaryContrast ? master.style.setProperty('--q-color-contrast', this.primaryContrast) : master.style.setProperty('--q-color-contrast', contrast)
    //   this.secondaryContrast ? master.style.setProperty('--q-color-contrast-two', this.secondaryContrast) : master.style.setProperty('--q-color-contrast-two', contrast2)
    //   return this.primaryContrast ? this.primaryContrast : contrast
    // },
    handlerEvent() {
      //handler toggleMasterDrawer
      eventBus.on('toggleMasterDrawer', (drawerName) => this.toggleDrawer(drawerName))
      //handler openMasterDrawer
      eventBus.on('openMasterDrawer', (drawerName) => this.drawer[drawerName] = true)
    },
    //Show drawer specific
    toggleDrawer(drawerName) {
      //Hidden all drawers
      for (var drawer in this.drawer) {
        if (drawer != drawerName) {
          if ((drawer == 'menu') && (this.windowSize != 'mobile')) {
            this.miniState = true
          } else {
            this.drawer[drawer] = false
          }
        }
      }
      //Toogle drawer
      if (drawerName == 'menu') {
        if (this.windowSize == 'mobile') {
          this.miniState = false
          this.drawer.menu = !this.drawer.menu
        } else {
          this.drawer.menu = true
          this.miniState = !this.miniState
        }
      } else {
        this.drawer[drawerName] = !this.drawer[drawerName]
      }
    }
  }
}
</script>
<style lang="scss">
  .navMaster .q-item.item-is-active .q-item__section,
  .navMaster .q-item.item-is-active .q-icon {
    color: var(--q-primary);
  }

  .navMaster .q-item .q-item__section--avatar .q-icon {
    font-size: 20px;
    color: var(--q-primary);
  }
</style>
