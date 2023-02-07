import { writeFile } from 'node:fs/promises'
import { loadConfig } from 'c12'
import fs from 'fs-extra'
import { buildElement } from './builder'
import { VueElementorConfigSchema } from './schema'
import { wordpressPluginTemplate, wordpressWidgetTemplate } from './templates'

export const main = async () => {
  const config = await VueElementorConfigSchema.parseAsync(await loadConfig({
    name: 'vue-elementor',
  }).then(({ config }) => config))

  await fs.rm('elementor-dist', { recursive: true, force: true })
  await fs.ensureDir('elementor-dist')

  await fs.rm('wordpress-plugin', { recursive: true, force: true })
  await fs.ensureDir('wordpress-plugin/assets')

  await writeFile('wordpress-plugin/wordpress-plugin.php', await wordpressPluginTemplate(config.elements))

  for (const element of config.elements) {
    await writeFile(
    `wordpress-plugin/${element.name}.widget.php`,
    await wordpressWidgetTemplate(element),
    )
    await buildElement(element, config.wordpressArchitecture)
  }

  await fs.rm('dist', { recursive: true, force: true })
  await fs.rm('elementor-dist', { recursive: true, force: true })
}
