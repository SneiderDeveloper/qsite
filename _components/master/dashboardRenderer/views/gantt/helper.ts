import moment, { Moment } from 'moment'
import {
  ChunkUnit,
  Context,
  Feature,
  Gantt,
  Marker,
  Range,
  TimelineBlock,
  TimelineFeature,
  TimelineGroup,
  TimelineRow,
} from './interface'

export const GANTT_CONTEXT = Symbol('ganttContext')

export const HEADER_HEIGHT = 60
export const ROW_HEIGHT = 36
// Lane kept under the header so a marker label never lands over the first row
export const MARKER_HEIGHT = 26
export const GANTT_HEIGHT = 337
export const SIDEBAR_WIDTH = 300
export const RANGES: Range[] = ['hourly', 'daily', 'monthly', 'quarterly']
export const ZOOM = { min: 50, max: 200, step: 25, default: 100 }
export const PERIOD_FORMAT = 'YYYY-MM-DD'
export const MAX_PERIODS: { [key in Range]: number } = {
  hourly: 14,
  daily: 24,
  monthly: 20,
  quarterly: 20,
}

const COLUMN_WIDTH: { [key in Range]: number } = {
  hourly: 60,
  daily: 50,
  monthly: 150,
  quarterly: 100,
}

const MINUTES_PER_HOUR = 60
const MINUTES_PER_DAY = 1440
const HOURS_PER_DAY = 24
const MONTHS_PER_YEAR = 12
const MONTHS_PER_QUARTER = 3
const QUARTERS_PER_YEAR = 4
const NIGHT_STARTS_AT = 18
const NIGHT_ENDS_AT = 6

export const getColumnWidth = (range: Range): number => (
  COLUMN_WIDTH[range] || COLUMN_WIDTH.monthly
)

export const getParsedColumnWidth = (context: Context): number => (
  (context.columnWidth * context.zoom) / 100
)

// The timeline is split in chunks: a day when the range is hourly,
// a month when it is daily and a year for the wider ones
export const getChunkUnit = (range: Range): ChunkUnit => {
  if (range === 'hourly') return 'day'
  if (range === 'daily') return 'month'
  return 'year'
}

export const getColumnsInChunk = (period: string, range: Range): number => {
  if (range === 'hourly') return HOURS_PER_DAY
  if (range === 'daily') return moment(period).daysInMonth()
  return MONTHS_PER_YEAR
}

export const getChunkWidth = (period: string, context: Context): number => (
  getColumnsInChunk(period, context.range) * getParsedColumnWidth(context)
)

export const getTimelineStart = (context: Context): Moment => (
  moment(context.periods[0] || moment().startOf(getChunkUnit(context.range)))
)

export const parseDate = (
  value: string | Date | undefined | null,
  isEnd: boolean = false
): Moment | null => {
  if (!value) return null
  const date = moment(value)
  if (!date.isValid()) return null

  const isMidnight = !date.hours() && !date.minutes() && !date.seconds()
  return isEnd && isMidnight ? date.endOf('day') : date
}

const getDayFraction = (date: Moment): number => (
  date.diff(date.clone().startOf('day'), 'minutes') / MINUTES_PER_DAY
)

export const getOffset = (date: Moment, context: Context): number => {
  const columnWidth = getParsedColumnWidth(context)
  const timelineStart = getTimelineStart(context)

  if (context.range === 'hourly') {
    const hours = date.clone().startOf('hour').diff(timelineStart, 'hours')
    return (hours + (date.minutes() / MINUTES_PER_HOUR)) * columnWidth
  }

  if (context.range === 'daily') {
    const days = date.clone().startOf('day').diff(timelineStart, 'days')
    return (days + getDayFraction(date)) * columnWidth
  }

  const months = date.clone().startOf('month').diff(timelineStart, 'months')
  const dayOffset = (date.date() - 1 + getDayFraction(date)) / date.daysInMonth()

  return (months + dayOffset) * columnWidth
}

const getMinWidth = (startAt: Moment, context: Context): number => {
  const columnWidth = getParsedColumnWidth(context)

  if (context.range === 'hourly') return columnWidth / 4
  if (context.range === 'daily') return columnWidth

  return columnWidth / startAt.daysInMonth()
}

// Features without an end date are painted with a default width of two columns 
export const getWidth = (
  startAt: Moment,
  endAt: Moment | null,
  context: Context
): number => {
  if (!endAt) return getParsedColumnWidth(context) * 2

  return Math.max(
    getOffset(endAt, context) - getOffset(startAt, context),
    getMinWidth(startAt, context)
  )
}

export const getDuration = (startAt: Moment, endAt: Moment | null): string => (
  moment.duration((endAt || moment()).diff(startAt)).humanize()
)


// Header blocks painted over the timeline,
// a block is a day when the range is hourly, a month when it is daily,
// a quarter when it is quarterly and a year when it is monthly
export const getTimelineBlocks = (context: Context): TimelineBlock[] => {
  const blocks: TimelineBlock[] = []

  context.periods.forEach(period => {
    const startOfPeriod = moment(period)
    const year = startOfPeriod.year()

    if (context.range === 'hourly') {
      blocks.push({
        id: period,
        title: startOfPeriod.format('dddd, DD MMMM YYYY'),
        columns: Array.from({ length: HOURS_PER_DAY }, (item, hour) => ({
          label: startOfPeriod.clone().hour(hour).format('HH'),
          secondary: hour < NIGHT_ENDS_AT || hour >= NIGHT_STARTS_AT,
        })),
      })
      return
    }

    if (context.range === 'daily') {
      blocks.push({
        id: period,
        title: startOfPeriod.format('MMMM YYYY'),
        columns: Array.from({ length: startOfPeriod.daysInMonth() }, (item, day) => {
          const date = startOfPeriod.clone().date(day + 1)
          return {
            label: date.format('D'),
            sublabel: date.format('dd').charAt(0),
            secondary: [0, 6].includes(date.day()),
          }
        }),
      })
      return
    }

    if (context.range === 'quarterly') {
      for (let quarter = 0; quarter < QUARTERS_PER_YEAR; quarter++) {
        blocks.push({
          id: `${year}-q${quarter}`,
          title: `Q${quarter + 1} ${year}`,
          columns: Array.from({ length: MONTHS_PER_QUARTER }, (item, month) => ({
            label: moment([year, (quarter * MONTHS_PER_QUARTER) + month, 1]).format('MMM'),
          })),
        })
      }
      return
    }

    blocks.push({
      id: `${year}`,
      title: `${year}`,
      columns: Array.from({ length: MONTHS_PER_YEAR }, (item, month) => ({
        label: moment([year, month, 1]).format('MMM'),
      })),
    })
  })

  return blocks
}

// Features sharing a row could be overlapped, so every one of them
// is moved to the first sub row available
const getSubRows = (features: TimelineFeature[]): TimelineFeature[] => {
  const subRowEndTimes: number[] = []

  return [...features]
    .sort((a, b) => a.startAt.valueOf() - b.startAt.valueOf())
    .map(feature => {
      const endAt = (feature.endAt || feature.startAt).valueOf()
      let subRow = 0

      while (
        subRow < subRowEndTimes.length &&
        subRowEndTimes[subRow] > feature.startAt.valueOf()
      ) subRow++

      subRowEndTimes[subRow] = endAt
      return { ...feature, subRow }
    })
}

// Features sharing the same lane are painted in the same row 
const getTimelineRows = (features: Feature[]): TimelineRow[] => {
  const lanes = new Map<string, TimelineFeature[]>()

  features.forEach((feature, index) => {
    const startAt = parseDate(feature.startAt)
    if (!startAt) return

    const lane = String(feature.lane || feature.id || index)
    lanes.set(lane, [
      ...(lanes.get(lane) || []),
      {
        ...feature,
        id: feature.id || `${lane}-${index}`,
        startAt,
        endAt: parseDate(feature.endAt, true),
        subRow: 0,
      },
    ])
  })

  return Array.from(lanes).map(([lane, laneFeatures]) => {
    const subRowFeatures = getSubRows(laneFeatures)
    const [firstFeature] = laneFeatures
    const endDates = subRowFeatures.flatMap(feature => feature.endAt || [])

    return {
      id: lane,
      name: firstFeature.lane || firstFeature.name,
      status: firstFeature.status,
      startAt: moment.min(subRowFeatures.map(feature => feature.startAt)),
      endAt: endDates.length ? moment.max(endDates) : null,
      subRows: Math.max(...subRowFeatures.map(feature => feature.subRow)) + 1,
      features: subRowFeatures,
    }
  })
}

// When there are no groups every feature belongs to the same unnamed group
export const getTimelineGroups = (data: Gantt): TimelineGroup[] => {
  const groups = data?.groups?.length
    ? data.groups
    : [{ features: data?.features || [] }]

  return groups.flatMap((group, index) => {
    const rows = getTimelineRows(group?.features || [])
    if (!rows.length && !group?.name) return []

    return {
      id: group?.id || `group-${index}`,
      name: group?.name || null,
      rows,
    }
  })
}

export const getTimelineMarkers = (markers: Marker[] = []) => (
  markers.flatMap((marker, index) => {
    const date = parseDate(marker?.date)
    if (!date) return []

    return { ...marker, id: marker?.id || `marker-${index}`, date }
  })
)
