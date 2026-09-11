import {
  ref,
  onMounted,
  toRefs,
  watch,
  onBeforeUnmount,
  computed
} from 'vue';
import { eventBus } from 'src/plugins/utils.ts'
import service from '../../services'
import { Embedded, Attributes } from './interface'
import { embeddedModel } from './models'
import store from '../../store'

export default function controller(props: any, emit: any) {

  const { apiRoute, data } = toRefs(props)

  const DEFAULT_HEIGHT = '337px'
  const OMITTED_ATTRIBUTES = ['width', 'height', 'style', 'class']
  const ALLOWED_ATTRIBUTES = [
    'title',
    'allow',
    'sandbox',
    'loading',
    'referrerpolicy',
    'allowfullscreen',
  ]

  const refs = {
    isLoading: ref(true),
    embeddedData: ref<Embedded>({ ...embeddedModel }),
    localFilters: ref({}),
  }

  const methods = {
    getAttributesFromIframe: (iframe?: string): Attributes => {
      if (!iframe) return {}

      const element = new DOMParser()
        .parseFromString(iframe, 'text/html')
        .querySelector('iframe')

      if (!element) return {}

      return Array.from(element.attributes).reduce((attributes, { name, value }) => {
        if (OMITTED_ATTRIBUTES.includes(name)) return attributes
        return { ...attributes, [name]: value }
      }, {})
    },
    getData: async (filters, refresh: boolean = false): Promise<Embedded> => {
      return await service.getQuickCardData(apiRoute.value, filters, refresh)
    },
    fetchEmbeddedData: async (refresh: boolean = false) => {
      refs.isLoading.value = true
      if (apiRoute.value) {
        const mergingFilter = {
          ...store.globalFilters || {},
          ...refs.localFilters.value || {}
        }
        refs.embeddedData.value = await methods.getData(mergingFilter, refresh)
      } else refs.embeddedData.value = data.value
      refs.isLoading.value = false
    },
    updateFilters: async (filters) => {
      refs.localFilters.value = filters
      await methods.fetchEmbeddedData()
    },
    openInNewTab: () => {
      if (computeds.src.value) window.open(computeds.src.value, '_blank')
    },
  }

  const computeds = {
    attributes: computed((): Attributes => {
      const embedded: any = refs.embeddedData.value || {}
      const attributes = methods.getAttributesFromIframe(embedded?.iframe)

      return ALLOWED_ATTRIBUTES.reduce((allAttributes, attribute) => {
        if (embedded[attribute] === undefined) return allAttributes
        return { ...allAttributes, [attribute]: embedded[attribute] }
      }, { ...attributes, ...(embedded?.url ? { src: embedded.url } : {}) })
    }),
    src: computed(() => computeds.attributes.value?.src),
    height: computed(() => {
      const height = refs.embeddedData.value?.height
      if (!height) return DEFAULT_HEIGHT
      return typeof height === 'number' ? `${height}px` : height
    }),
    thereAreData: computed(() => !!computeds.src.value),
  }

  const tools = [
    {
      name: 'newTab',
      icon: 'fa-regular fa-arrow-up-right-from-square',
      action: methods.openInNewTab,
    },
  ]

  onMounted(async () => {
    await methods.fetchEmbeddedData()

    eventBus.on('crud.data.refresh', async () => {
      await methods.fetchEmbeddedData(true)
    })
  })

  onBeforeUnmount(() => {
    eventBus.off('crud.data.refresh')
  })

  watch(() => store.globalFilters, async (): Promise<void> => {
    await methods.fetchEmbeddedData()
  }, { deep: true })

  return { ...refs, ...methods, ...computeds, tools }
}
