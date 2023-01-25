export interface WidgetControl {
  responsive?: boolean
  inlineEditable?: boolean
  name: string
  label: string
  type: 'TEXT' | 'NUMBER' | 'TEXTAREA' | 'SELECT' | 'SWITCHER'
}

export interface WidgetControlSection {
  name: string
  label: string
  tab: 'TAB_CONTENT' | 'TAB_STYLE' | 'TAB_ADVANCED' | 'TAB_LAYOUT' | 'TAB_SETTINGS'
  controls: WidgetControl[]
}

export interface Config {
  pluginName: string
  widgets: {
    name: string
    componentPath: string
    controls: WidgetControlSection[]
  }[]
}

export interface PluginMainTemplateOptions {
  pluginName: string
  widgets: { name: string }[]
}

export interface WidgetTemplateOptions {
  name: string
  pluginName: string
  controls: WidgetControlSection[]
}
