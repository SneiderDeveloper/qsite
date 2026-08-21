import { Moment } from 'moment'
import { Header } from '../../interface'

export type Range = 'hourly' | 'daily' | 'monthly' | 'quarterly'

export type ChunkUnit = 'day' | 'month' | 'year'

export interface Filters {
  [key: string]: unknown,
}

export interface Status {
  id?: string | number,
  name?: string,
  color?: string,
}

export interface Feature {
  id?: string | number,
  name: string,
  startAt: string | Date,
  endAt?: string | Date,
  lane?: string,
  status?: Status,
  className?: string,
  tooltip?: string,
}

export interface Group {
  id?: string | number,
  name?: string,
  features: Feature[],
}

export interface Marker {
  id?: string | number,
  date: string | Date,
  label: string,
  className?: string,
}

export interface Sidebar {
  show?: boolean,
  width?: number,
  labels?: {
    name?: string,
    duration?: string,
    empty?: string,
  },
}

export interface Gantt {
  header?: Header,
  range: Range,
  zoom: number,
  today?: boolean,
  sidebar?: Sidebar,
  markers?: Marker[],
  groups?: Group[],
  features?: Feature[],
}

export interface TimelineFeature {
  id: string | number,
  name: string,
  startAt: Moment,
  endAt: Moment | null,
  lane?: string,
  status?: Status,
  className?: string,
  tooltip?: string,
  subRow: number,
}

export interface TimelineRow {
  id: string,
  name: string,
  status?: Status,
  startAt: Moment,
  endAt: Moment | null,
  subRows: number,
  features: TimelineFeature[],
}

export interface TimelineGroup {
  id: string | number,
  name: string | null,
  rows: TimelineRow[],
}

export interface TimelineColumn {
  label: string,
  sublabel?: string,
  secondary?: boolean,
}

export interface TimelineBlock {
  id: string,
  title: string,
  columns: TimelineColumn[],
}

export interface Context {
  range: Range,
  zoom: number,
  columnWidth: number,
  sidebarWidth: number,
  headerHeight: number,
  rowHeight: number,
  periods: string[],
}
