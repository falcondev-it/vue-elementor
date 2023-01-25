import path from 'path'
import slugify from 'slugify'
import fs, { ensureDir } from 'fs-extra'
import type { Config } from './types'
import { pluginMainTemplate, widgetTemplate } from './templates/elementor'
import { buildWidgetClientScript } from './parcel'

export const buildElementorWidget = async (pluginDir: string, pluginName: string, options: Config['widgets'][0]) => {
  const name = slugify(options.name, { lower: true })
  const widgetDir = path.join(pluginDir, name)

  await ensureDir(widgetDir)

  await fs.writeFile(path.join(widgetDir, `${name}.php`), widgetTemplate({
    name,
    pluginName,
    controls: options.controls,
  }))
  await fs.writeFile(path.join(widgetDir, 'client.js'), await buildWidgetClientScript(options.componentPath))
}

export const buildElementorPlugin = async (options: Config) => {
  const name = slugify(options.pluginName, { lower: true })
  const pluginDir = path.join(process.cwd(), 'dist', name)

  await fs.ensureDir(pluginDir)

  await Promise.all(options.widgets.map(widget => buildElementorWidget(pluginDir, name, widget)))

  await fs.writeFile(path.join(pluginDir, 'index.php'), pluginMainTemplate({
    pluginName: name,
    widgets: options.widgets,
  }))
}
