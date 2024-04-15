<template>
  <div v-show="showMenu">
    <div class="listMenu">
      <q-no-ssr v-for="(item,key) in menuData" :key="key" :class="`content-item ${inLine ? 'inline-block' : ''}`">
        <!--ToolTip-->
        <q-tooltip v-if="withTooltip" v-bind="tooltipProps || {}">{{
            translatable ? $tr(item.title) : item.title
          }}
        </q-tooltip>
        <!--Single Item-->
        <q-item :id="`menuItem-${parseIdItem(item.name)}` || `menuItem-${key}`" v-bind="item.itemProps"
                v-if="item.itemProps?.vIf != undefined ? item.itemProps?.vIf : true">
          <q-item-section v-if="item.icon && showIcons" avatar>
            <q-icon :name="item.icon"/>
          </q-item-section>
          <q-item-section class="text-capitalize"> {{ translatable ? $tr(item.title) : item.title }}
          </q-item-section>
        </q-item>

        <!-- Dropdwon Item -->
        <q-expansion-item v-else-if="checkItemMultiple(item)" :icon="item.icon" :key="key"
                          :label="translatable ? $tr(item.title) : item.title"
                          v-bind="group ? {group : listUid} : {}"
                          :header-class="selectedChildren(item)" :default-opened="selectedChildren(item) ? true : false"
                          :class="selectedChildren(item) ? 'expansion-selected' : ''">
          <!--Recursive item-->
          <recursive-menu :translatable="translatable" :show-icons="showIcons"
                          :key="key" :menu="item.children" :group="group"/>
        </q-expansion-item>
      </q-no-ssr>
    </div>
  </div>
</template>
<script>
export default {
  name: 'recursiveMenu',
  components: {},
  props: {
    withTooltip: {type: Boolean, default: false},
    menu: {default: false},
    showIcons: {type: Boolean, default: true},
    translatable: {type: Boolean, default: true},
    inLine: {type: Boolean, default: false},
    group: {type: Boolean, defualt: false},
    tooltipProps: {type: Object, default: null}
  },
  watch: {
    menu() {
      this.init()
    }
  },
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      showMenu: false,
      listUid: this.$uid().toString(),
      props: {}
    }
  },
  computed: {
    menuData() {
      let menu = this.$props.menu.map(item => {
        //Instance item props
        item.itemProps = {
          class: this.getClassItem(item),
          tag: 'a',
          key: this.$uid(),
          vIf: this.checkItemSingle(item),
          clickable: true
        }

        //Define redirect
        if (item.toRoute) item.itemProps.href = item.toRoute
        else item.itemProps.to = {name: item.name, params: item.params || {}}

        //Return item
        return item
      })

      //Response
      return menu
    }
  },
  methods: {
    //init
    init() {
      this.props = this.$clone(this.$props)
      setTimeout(() => {
        this.checkCollapsibles()
        this.showMenu = true
      }, 300)
    },
    //Parse Id Item
    parseIdItem(idItem) {
      return idItem.replaceAll(".", "");
      ;
    },
    //Validate if should load single-item
    checkItemSingle(item) {
      let response = true
      if (!item.activated) response = false
      if (item.children) response = false
      if (!item.name) response = false
      if (item.permission && !this.$hasAccess(item.permission)) response = false
      return response//Response
    },
    //Validate if should load multi-item
    checkItemMultiple(item) {
      let response = true
      if (!item.children) response = false
      if (item.children && !item.children.length) response = false
      if (item.permission && !this.$hasAccess(item.permission)) response = false
      return response//Response
    },
    //Validate if should load all multi-item
    checkCollapsibles() {
      let collapsibles = this.$el.getElementsByClassName('q-expansion-item')

      for (let group of collapsibles) {
        let items = group.getElementsByClassName('single-item')
        if (!items.length) group.style.display = 'none'
      }
    },
    //Redirect to route of pages
    redirectTo(item) {
      if (item.linkType && (item.linkType == 'external')) {
        window.open(`https://${item.url}`, item.target)
      } else if (item.name) {
        this.$router.push({name: item.name, params: item.params || {}})
      }
    },
    //Validate if children of multi-item is selected
    selectedChildren(item) {
      let response = ''//Defualt response

      //Validate if current route name is like children
      let validateRouteName = (children) => {
        let routeName = this.$route.name//Route name
        let response = false// Default response
        if (children)
          children.forEach(element => {
            if (element.name == routeName) response = true
            if (element.children && validateRouteName(element.children)) response = true
          })
        return response
      }

      //If has children's
      if (item.children && validateRouteName(item.children)) response = ' item-is-active'

      return response //Response
    },
    //Validate if item is same of current page
    getClassItem(item) {
      let response = 'single-item'

      if (this.$route.name == item.name) {
        if (JSON.stringify(this.$route.params) == JSON.stringify(item.params || {})) {
          response += ' item-is-active'
        }
      }

      return response
    }
  }
}
</script>
<style lang="scss">
.listMenu {
  .q-expansion-item__container {
    .q-expansion-item__content {
      padding: 0 0 0 15px;
    }
  }

  .q-item {
    cursor: pointer;
    color: $grey-9;

    .q-item__section--avatar {
      min-width: 20px;
      padding-right: 10px;
    }

    .q-icon {
      font-size: 12px;
    }
  }
}
</style>


