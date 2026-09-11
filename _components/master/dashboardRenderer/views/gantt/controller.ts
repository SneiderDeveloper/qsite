import {
  ref,
  reactive,
  computed,
  provide,
  nextTick,
  toRefs,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue'
import moment, { Moment } from 'moment'
import { eventBus, i18n } from 'src/plugins/utils'
import service from '../../services'
import store from '../../store'
import {
  ChunkUnit,
  Context,
  Filters,
  Gantt,
  Range,
  TimelineFeature,
} from './interface'
import { ganttModel } from './models'
import {
  GANTT_CONTEXT,
  GANTT_HEIGHT,
  HEADER_HEIGHT,
  MARKER_HEIGHT,
  MAX_PERIODS,
  PERIOD_FORMAT,
  RANGES,
  ROW_HEIGHT,
  SIDEBAR_WIDTH,
  ZOOM,
  getChunkUnit,
  getChunkWidth,
  getColumnWidth,
  getOffset,
  getTimelineGroups,
  getTimelineMarkers,
  getTimelineStart,
} from './helper'

export default function controller(props: any, emit: any) {

  const { apiRoute, data } = toRefs(props)

  const refs = {
    isLoading: ref(true),
    ganttData: ref<Gantt>({ ...ganttModel }),
    ganttRef: ref<any>(null),
    localFilters: ref<Filters>({}),
  }

  const state = reactive<{ range: Range, zoom: number, periods: string[] }>({
    range: ganttModel.range,
    zoom: ganttModel.zoom,
    periods: [],
  })

  // Read by the other computeds and by the methods, so they are declared apart
  const showSidebar = computed(() => refs.ganttData.value?.sidebar?.show !== false)
  const groups = computed(() => getTimelineGroups(refs.ganttData.value))
  const markers = computed(() => getTimelineMarkers(refs.ganttData.value?.markers))
  const showToday = computed(() => refs.ganttData.value?.today !== false)
  // The lane only takes room when there is something to paint in it
  const markerHeight = computed(() => (
    markers.value.length || showToday.value ? MARKER_HEIGHT : 0
  ))
  const context = computed<Context>(() => ({
    range: state.range,
    zoom: state.zoom,
    columnWidth: getColumnWidth(state.range),
    sidebarWidth: showSidebar.value
      ? (refs.ganttData.value?.sidebar?.width || SIDEBAR_WIDTH)
      : 0,
    headerHeight: HEADER_HEIGHT,
    rowHeight: ROW_HEIGHT,
    periods: state.periods,
  }))

  const computeds = {
    context,
    groups,
    markers,
    showSidebar,
    showToday,
    markerHeight,
    today: computed(() => moment()),
    thereAreGroups: computed(() => groups.value.length > 0),
    cssVariables: computed(() => ({
      '--gantt-zoom': `${context.value.zoom}`,
      '--gantt-height': `${GANTT_HEIGHT}px`,
      '--gantt-marker-height': `${markerHeight.value}px`,
      height: 'var(--gantt-height)',
      '--gantt-column-width': `${(context.value.zoom / 100) * context.value.columnWidth}px`,
      '--gantt-header-height': `${HEADER_HEIGHT}px`,
      '--gantt-row-height': `${ROW_HEIGHT}px`,
      '--gantt-sidebar-width': `${context.value.sidebarWidth}px`,
      gridTemplateColumns: 'var(--gantt-sidebar-width) 1fr',
    })),
  }

  const methods = {
    getData: async (filters: Filters, refresh: boolean = false): Promise<Gantt> => {
      return await service.getQuickCardData(apiRoute.value, filters, refresh)
    },
    // Dates covered by the data, today is included unless the range is hourly
    getDataBounds: (): { first: Moment, last: Moment } => {
      const rows = groups.value.flatMap(group => group.rows)
      const today = moment()
      if (!rows.length) return { first: today, last: today }

      const dates = [
        ...rows.map(row => row.startAt),
        ...rows.map(row => row.endAt || row.startAt),
        ...markers.value.map(marker => marker.date),
        ...(state.range === 'hourly' ? [] : [today]),
      ]

      return { first: moment.min(dates).clone(), last: moment.max(dates).clone() }
    },
    // The timeline starts one chunk before the data and ends one chunk after it.
    // The amount of chunks is capped BEFORE building them: a single far away
    // date, a 9999 sentinel for instance, would otherwise generate millions
    setTimeline: () => {
      const unit = getChunkUnit(state.range)
      const maxPeriods = MAX_PERIODS[state.range]
      const { first, last } = methods.getDataBounds()

      const from = first.startOf(unit).subtract(1, unit)
      const to = last.startOf(unit).add(1, unit)
      const total = Math.max(to.diff(from, unit) + 1, 1)
      const start = total <= maxPeriods
        ? from
        : methods.getCappedStart(from, to, unit, maxPeriods)

      state.periods = Array.from(
        { length: Math.min(total, maxPeriods) },
        (item, index) => start.clone().add(index, unit).format(PERIOD_FORMAT)
      )
    },
    // Data too wide to be painted at once is windowed around the initial date
    getCappedStart: (
      from: Moment,
      to: Moment,
      unit: ChunkUnit,
      maxPeriods: number
    ): Moment => {
      const centered = methods.getInitialDate()
        .startOf(unit)
        .subtract(Math.floor(maxPeriods / 2), unit)
      const latest = to.clone().subtract(maxPeriods - 1, unit)

      return moment.max(from, moment.min(centered, latest))
    },
    fetchGanttData: async (refresh: boolean = false) => {
      refs.isLoading.value = true
      if (apiRoute.value) {
        const mergingFilter = {
          ...store.globalFilters || {},
          ...refs.localFilters.value || {}
        }
        refs.ganttData.value = await methods.getData(mergingFilter, refresh)
      } else refs.ganttData.value = data.value

      state.range = refs.ganttData.value?.range || ganttModel.range
      state.zoom = refs.ganttData.value?.zoom || ganttModel.zoom
      methods.setTimeline()
      refs.isLoading.value = false

      await nextTick()
      methods.scrollToDate(methods.getInitialDate(), false)
    },
    // The timeline opens over today, or over the first feature when today is out of range
    getInitialDate: (): Moment => {
      const rows = groups.value.flatMap(group => group.rows)
      if (!rows.length) return moment()

      const today = moment()
      const starts = rows.map(row => row.startAt)
      const firstDate = moment.min(starts)
      const lastDate = moment.max(starts)

      return today.isBetween(firstDate, lastDate) ? today : firstDate.clone()
    },
    updateFilters: async (filters: Filters) => {
      refs.localFilters.value = filters
      await methods.fetchGanttData()
    },
    scrollToDate: (date: Moment, smooth: boolean = true) => {
      const element = refs.ganttRef.value
      if (!element) return

      const { sidebarWidth } = context.value
      const offset = getOffset(date, context.value)
      const left = offset - ((element.clientWidth - sidebarWidth) / 2)

      element.scrollTo({
        left: Math.max(left, 0),
        behavior: smooth ? 'smooth' : 'auto',
      })
    },
    scrollToToday: () => methods.scrollToDate(moment()),
    selectFeature: (feature: TimelineFeature) => emit('selectFeature', feature),
    /* The timeline grows to the past or to the future when its edges are reached */
    handleScroll: () => {
      const element = refs.ganttRef.value
      if (!element || refs.isLoading.value) return

      const { scrollLeft, scrollWidth, clientWidth } = element
      const unit = getChunkUnit(state.range)

      if (scrollLeft <= 0) {
        const period = moment(state.periods[0]).subtract(1, unit).format(PERIOD_FORMAT)
        state.periods = [period, ...state.periods]
        return nextTick(() => {
          element.scrollLeft = getChunkWidth(period, context.value)
        })
      }

      if ((scrollLeft + clientWidth) >= scrollWidth) {
        const lastPeriod = state.periods[state.periods.length - 1]
        state.periods = [
          ...state.periods,
          moment(lastPeriod).add(1, unit).format(PERIOD_FORMAT),
        ]
      }
    },
    // The chunks are rebuilt because the hourly range splits the timeline in days
    toggleRange: () => {
      const nextRange = (RANGES.indexOf(state.range) + 1) % RANGES.length
      const centeredDate = methods.getCenteredDate()
      state.range = RANGES[nextRange]
      methods.setTimeline()
      nextTick(() => methods.scrollToDate(centeredDate, false))
    },
    updateZoom: (step: number) => {
      const zoom = Math.min(Math.max(state.zoom + step, ZOOM.min), ZOOM.max)
      if (zoom === state.zoom) return

      const centeredDate = methods.getCenteredDate()
      state.zoom = zoom
      nextTick(() => methods.scrollToDate(centeredDate, false))
    },
    zoomIn: () => methods.updateZoom(ZOOM.step),
    zoomOut: () => methods.updateZoom(-ZOOM.step),
    /* Date painted in the middle of the timeline, used to keep it after a zoom or range change */
    getCenteredDate: (): Moment => {
      const element = refs.ganttRef.value
      const timeline = context.value
      if (!element) return moment()

      const center = element.scrollLeft + ((element.clientWidth - timeline.sidebarWidth) / 2)
      const columnWidth = (timeline.columnWidth * timeline.zoom) / 100
      const columns = center / columnWidth
      const units: { [key in Range]: moment.unitOfTime.DurationConstructor } = {
        hourly: 'hours',
        daily: 'days',
        monthly: 'months',
        quarterly: 'months',
      }

      return getTimelineStart(timeline).add(Math.round(columns), units[timeline.range])
    },
  }

  const tools = [
    {
      name: 'range',
      icon: 'fa-regular fa-calendar-range',
      action: methods.toggleRange,
    },
    {
      name: 'today',
      icon: 'fa-regular fa-location-crosshairs',
      action: methods.scrollToToday,
    },
    {
      name: 'zoomOut',
      icon: 'fa-regular fa-magnifying-glass-minus',
      action: methods.zoomOut,
    },
    {
      name: 'zoomIn',
      icon: 'fa-regular fa-magnifying-glass-plus',
      action: methods.zoomIn,
    },
  ]

  const todayLabel = i18n.tr('isite.cms.label.today')

  provide(GANTT_CONTEXT, context)

  onMounted(async () => {
    await methods.fetchGanttData()

    eventBus.on('crud.data.refresh', async () => {
      await methods.fetchGanttData(true)
    })
  })

  onBeforeUnmount(() => {
    eventBus.off('crud.data.refresh')
  })

  watch(() => store.globalFilters, async (): Promise<void> => {
    await methods.fetchGanttData()
  }, { deep: true })

  return { ...refs, ...toRefs(state), ...computeds, ...methods, tools, todayLabel }
}
