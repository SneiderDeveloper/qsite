import { ref, onMounted, onBeforeUnmount, toRefs, watch, computed } from 'vue'
import { eventBus, store as storeUtil } from 'src/plugins/utils.ts'
import service from '../../../../services'
import { Ticker } from './interface'
import { tickerModel } from './models'

export default function controller(props: any, emit: any) {

  const { apiRoute, permission, data, filters } = toRefs(props)
  const { hasAccess } = storeUtil

  const refs = {
    isLoading: ref(true),
    ticker: ref<Ticker>({ ...tickerModel }),
  }

  const computeds = {
    havePermission: computed(() => hasAccess(permission.value))
  }

  const methods = {
    getData: async (refresh?: boolean): Promise<Ticker> => {
      return await service.getQuickCardData(apiRoute.value, filters.value, refresh)
    }
  }

  onMounted(async () => {
    refs.isLoading.value = true
    if (apiRoute.value && permission.value && computeds.havePermission.value) {
      refs.ticker.value = await methods.getData()
    } else if (data.value && permission.value && computeds.havePermission.value) {
      refs.ticker.value = data.value
    }
    refs.isLoading.value = false

    eventBus.on('crud.data.refresh', async () => {
      refs.isLoading.value = true
      if (apiRoute.value && permission.value && computeds.havePermission.value) {
        refs.ticker.value = await methods.getData(true)
      }
      refs.isLoading.value = false
    })
  })

  onBeforeUnmount(() => {
    eventBus.off('crud.data.refresh')
  })

  watch(filters, async (): Promise<void> => {
    refs.isLoading.value = true
    if (apiRoute.value && permission.value && computeds.havePermission.value) {
      refs.ticker.value = await methods.getData(false)
    }
    refs.isLoading.value = false
  }, { deep: true })

  return {...refs, ...methods, ...computeds }
}