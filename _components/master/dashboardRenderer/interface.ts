export interface Tickers {
  apiRoute: string,
  permission: string,
  valueHidden?: boolean
}

export interface Toolbox {
  tools?: {
    name: string,
    icon: string,
    action: Function,
  },
  features: {
    [key: string]: boolean | object,
  },
}

export interface Setting {
  apiRoute?: string,
  type: string, 
  permission: string,
  className?: string,
  tickers?: Tickers[],
  header?: Header,
  toolbox?: Toolbox,
}

export interface View {
  apiRoute: string 
  component: any, 
}

export interface Header {
  title: string,
  icon?: string,
  cssStyle?: {
    [key: string]: string | number,
  }
}
