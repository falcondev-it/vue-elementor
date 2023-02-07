import { writeFile } from 'node:fs/promises'
import { loadConfig } from 'c12'
import fs from 'fs-extra'
import slugify from 'slugify'
import { buildElement } from './builder'
import { VueElementorConfigSchema } from './schema'
import { wordpressPluginTemplate, wordpressWidgetTemplate } from './templates'

export const main = async () => {
  const config = await VueElementorConfigSchema.parseAsync(await loadConfig({
    name: 'vue-elementor',
  }).then(({ config }) => config))

  const pluginNameSlug = slugify(config.pluginName, { lower: true, strict: true })

  await fs.rm('elementor-dist', { recursive: true, force: true })
  await fs.ensureDir('elementor-dist')

  await fs.rm(pluginNameSlug, { recursive: true, force: true })
  await fs.ensureDir(`${pluginNameSlug}/assets`)

  await writeFile(`${pluginNameSlug}/${pluginNameSlug}.php`, await wordpressPluginTemplate(config.elements, config.pluginName))

  for (const element of config.elements) {
    await writeFile(
    `${pluginNameSlug}/${element.name}.widget.php`,
    await wordpressWidgetTemplate(element),
    )
    await buildElement(element, config.wordpressArchitecture, pluginNameSlug)
  }

  await fs.rm('dist', { recursive: true, force: true })
  await fs.rm('elementor-dist', { recursive: true, force: true })
}
