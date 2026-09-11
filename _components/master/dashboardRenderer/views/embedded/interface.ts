import { Header } from '../../interface'

export interface Embedded {
  header?: Header,
  iframe?: string,
  url?: string,
  height?: string | number,
  title?: string,
  allow?: string,
  sandbox?: string,
  loading?: 'lazy' | 'eager',
  referrerpolicy?: string,
  allowfullscreen?: boolean,
}

export interface Attributes {
  [key: string]: string | boolean,
}
