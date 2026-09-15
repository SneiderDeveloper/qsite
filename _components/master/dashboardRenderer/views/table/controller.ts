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
import { Table, Column, Row, ColorAssignment, Format } from './interface'
import { tableModel } from './models'
import store from '../../store'

const DEFAULT_CHIP_CLASS = 'tw-bg-neutral-200 tw-text-neutral-700'

export default function controller(props: any, emit: any) {

  const { apiRoute, data } = toRefs(props)
  
  const refs = {
    isLoading: ref(true),
    tableData: ref<Table>({ ...tableModel }),
    maxNumberPerColor: 0,
    localFilters: ref({}),
  }

  const methods = {
    getMaxNumberPerColor: (colorAssignment: ColorAssignment | undefined) => {
      if (!colorAssignment) return 0
      const { referenceColumn, colors } = colorAssignment
      const listOfNumber: number[] = refs.tableData.value.rows.map(row => Number(row[referenceColumn]))
      const maxNumber = Math.max(...listOfNumber)
      return maxNumber / colors.length
    },
    pickColor: (row: Row) => {
      if (!refs.tableData.value?.colorAssignment) return 'tw-bg-neutral-100'

      const ASCENDANT = 'asc'
      const DESCENDANT = 'desc'
      const { referenceColumn, colors, order } = refs.tableData.value?.colorAssignment
      const colorLength = colors.length - 1
      const colorIndex = Math.floor(Number(row[referenceColumn]) / refs.maxNumberPerColor)

      if (order === DESCENDANT) {
        const colorsReverse = [...colors].reverse()
        if (colorIndex >= colorLength) return colorsReverse[colorLength]
        return colorsReverse[colorIndex]
      }

      if (order === ASCENDANT) {
        if (colorIndex >= colorLength) return colors[colorLength]
        return colors[colorIndex]
      }
    },
    sort: (col: Column) => {
      if (!col) return
      refs.tableData.value?.rows.sort((a, b) => {
        const name = col.name
        const asc = col.asc
    
        if (a[name] < b[name]) return asc ? -1 : 1
        if (a[name] > b[name]) return asc ? 1 : -1
        return 0
      })
    },
    sortReverse: (column: Column) => {
      if (!column || !column.sortable) return
      refs.tableData.value?.columns.map(col => {
        if ((col.name === column.name) && col.sortable) {
          col.asc = !col?.asc
        }
      })

      methods.sort(column)
    },
    formatted: (value: string | number, format?: Format) => {
      if (value === null || value === undefined) return value
      if (format) return value.toLocaleString(format.locales, format.options)
      return value
    },
    chipStyle: (column: Column, row: Row) => {
      const chip = column?.chip || {}
      const value = row[column.name]
      const matched = chip.values?.[String(value)] || {}
      //  CSS colors (#hex, rgb(), var()) are used inline; Tailwind classes are used via the `class` attribute
      const bgColor = matched.bgColor || chip.bgColor
      const textColor = matched.textColor || chip.textColor

      return {
        label: String(matched.label ?? methods.formatted(value, column?.format) ?? ''),
        chipClass: matched.chipClass || chip.chipClass || DEFAULT_CHIP_CLASS,
        icon: matched.icon || chip.icon,
        style: {
          ...(bgColor ? { backgroundColor: bgColor } : {}),
          ...(textColor ? { color: textColor } : {}),
        },
      }
    },
    formatPercentage: (value: number | string) => {
      const percentage = Number(value) * 100
      
      return `${Math.round(percentage)}%`
    },
    getData: async (filters, refresh: boolean = false): Promise<Table> => {
      return await service.getQuickCardData(apiRoute.value, filters, refresh)
    },
    sortAndColor: () => {
      refs.maxNumberPerColor = methods.getMaxNumberPerColor(refs.tableData.value?.colorAssignment)
      refs.tableData.value?.columns?.forEach(col => methods.sort(col))
    },
    fetchTableData: async (refresh: boolean=false) => {
      refs.isLoading.value = true
      if (apiRoute.value) {
        const mergingFilter = {
          ...store.globalFilters || {},
          ...refs.localFilters.value || {}
        }
        refs.tableData.value = await methods.getData(mergingFilter, refresh)
      } else refs.tableData.value = data.value
      refs.isLoading.value = false
      methods.sortAndColor()
    },
    updateFilters: async (filters) => {
      refs.localFilters.value = filters
      await methods.fetchTableData()
    },
  }

  const computeds = {
    thereAreRows: computed(() => (
      refs.tableData.value?.rows && Object.keys(refs.tableData.value?.rows).length
    ))
  }

  onMounted(async () => {
    await methods.fetchTableData()
    
    eventBus.on('crud.data.refresh', async () => {
      await methods.fetchTableData(true)
    })
  })

  onBeforeUnmount(() => {
    eventBus.off('crud.data.refresh')
  })

  watch(() => store.globalFilters, async (): Promise<void> => {
    await methods.fetchTableData()
  }, { deep: true })

  return {...refs, ...methods, ...computeds }
}