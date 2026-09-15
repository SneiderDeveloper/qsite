import { Header } from '../../interface'

export interface Format {
  locales: string, 
  options: any 
}
export interface ChipStyle {
  label?: string,
  chipClass?: string,
  bgColor?: string,
  textColor?: string,
  icon?: string,
}

export interface Chip extends ChipStyle {
  values?: { [value: string]: ChipStyle },
}

export interface Column {
  name: string,
  label: string,
  align: 'center' | 'left' | 'right',
  field: string,
  sortable?: boolean,
  chip?: Chip,
  progress?: {
    barColor?: string,
    barTextColor?: string,
    badge?: {
      bgColor?: string,
      textColor?: string,
    }
  },
  asc?: boolean,
  headerClass?: string,
  bodyClass?: string,
  format?: Format,
}

export interface Row {
  [key: string]: string | number,
}

export interface ColorAssignment {
  referenceColumn: string,
  order: 'desc' | 'asc',
  colors: string[],
}

export interface Table {
  header?: Header, 
  colorAssignment?: ColorAssignment,
  columns: Column[],
  rows: Row[],
}
