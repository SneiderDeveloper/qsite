<template>
  <div id="shareLinkcomponent">
    <!--Button to open modal to share-->
    <q-btn icon="fa-light fa-share-alt"
      @click="openModal()"
      flat
      unelevated
      rounded
      v-if="showIcon"
    />
    <!--Modal Buttons-->
    <master-modal id="shareLinkModal" v-model="showModal" :title="$tr('isite.cms.label.share')" icon="fas fa-share-alt">
      <div>
        <!-- Content preview -->
        <div v-if="contentPreview && content" class="q-gutter-y-md">
          <div class="row">
            <div class="col-12">
              <q-input
                v-model="content"
                type="textarea"
                standout
                readonly
                autogrow
              />
            </div>
          </div>
          <div class="row col justify-center">
              <q-btn
                :label="$trp('isite.cms.label.copy')"
                color="primary"
                @click="copyToClipBoard(content)"
                unelevated
                rounded
                no-caps
              />
          </div>
        </div>
        <!--Available buttons to share-->
        <div v-else class="q-gutter-y-lg q-pt-xs">
          <div class="row q-gutter-x-md justify-center">
            <template
              v-for="(button, key) in availableButtons"
              :key="key"
            >
              <div
                v-if="button.icon"
                class="text-center platform"
                style="max-width: 70px;"
              >
                <q-btn
                  :icon="button.icon"
                  unelevated
                  :color="button.color"
                  align="center"
                  @click="shareLink(key)"
                  round
                />
                <div>
                  {{ button.label }}
                </div>
              </div>
            </template>
          </div>
          <div class="row">
            <dynamic-field class="col-12" :field="dinamycConfig"/>
          </div>
        </div>
      </div>
    </master-modal>
  </div>
</template>
<script>
  export default {
    props: {
      url: {default: null},
      embed: {default: null},
      showIcon: {default: false}
    },
    mounted() {
      this.$nextTick(function () {
        this.init()
      })
    },
    data() {
      return {
        showModal: false,
        contentPreview: false,
        link: null,
        content: null
      }
    },
    computed: {
      availableButtons() {
        return {
          content: this.content ? { icon: 'fa-light fa-code-simple', color: 'grey', label: this.$trp('isite.cms.label.insert') } : false,
          facebook: {
            icon: 'fa-brands fa-facebook',
            color: 'blue',
            label: 'Facebook',
            apiUrl: `https://www.facebook.com/sharer/sharer.php?u=${this.link}`
          },
          whatsapp: {
            icon: 'fab fa-whatsapp',
            color: 'green',
            label: 'Whatsapp',
            apiUrl: `https://api.whatsapp.com/send?text=${this.link}`
          },
          twitter: {
            icon: 'fas fa-times',
            color: 'dark',
            label: 'Twitter / X',
            apiUrl: `http://www.twitter.com/share?url=${this.link}`
          },
        }
      },
      stylePupop() {
        let windowH = window.innerHeight
        let windowW = window.innerWidth

        return `resizable,height=${windowH - 100},width=600,top=${50},left=${((windowW - 600) / 2)}`
      },
      dinamycConfig() {
        return {
          value: this.link,
          type: 'copy',
          props: {
            label: this.$tr('iqreable.cms.form.content')
          }
        }
      },
    },
    methods: {
      init() {
        this.stylePupop
        this.link = this.url
        this.content = this.embed
      },
      //Share link
      shareLink(platform) {
        if(platform == 'content'){
          this.contentPreview = true
        }else {
          this.openInNewWindow(this.availableButtons[platform].apiUrl)
        }
      },
      openModal(item = false){
        if(item){
          this.link = item.url ?? false
          this.content = item?.embed || item?.widgetHtml || false
        }
        this.contentPreview = (!this.link && this.content)
        this.showModal = true
      },
      openInNewWindow(url){
        window.open(url, '_blank', this.stylePupop)
      },
      copyToClipBoard(text){
        navigator.clipboard.writeText(text).then(() => {
          this.$alert.info(this.$tr('isite.cms.message.copiedToClipboard'))
        })
      }
    }
  }
</script>
<style lang="scss">
#shareLinkModal {
  .platform:hover {
    transform: scale(1.1);
    transition: all 0.2s ease-in-out;
  }
}
</style>
