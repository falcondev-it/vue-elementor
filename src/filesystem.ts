import fs from 'node:fs/promises'
import fsExtra from 'fs-extra'
import { CONFIG } from './config'
import type { VueElementorElement } from './schema'
import { templates } from './templates'

export const cleanupTempFolders = async () => Promise.all([
  fsExtra.rm('dist', { recursive: true, force: true }),
  fsExtra.rm('elementor-dist', { recursive: true, force: true }),
])

export const createBuildFolders = async () => {
  await Promise.all([
    fsExtra.rm('elementor-dist', { recursive: true, force: true }),
    fsExtra.rm(CONFIG.pluginNameSlug, { recursive: true, force: true }),
  ])
  await Promise.all([
    fsExtra.ensureDir('elementor-dist'),
    fsExtra.ensureDir(`${CONFIG.pluginNameSlug}/assets`),
  ])
}

export const createWordpressPluginFile = async () => {
  await fs.writeFile(`${CONFIG.pluginNameSlug}/${CONFIG.pluginNameSlug}.php`, await templates.wordpressPlugin())
}

export const createWordpressWidgetFile = async (element: VueElementorElement) => {
  await fs.writeFile(
    `${CONFIG.pluginNameSlug}/${element.name}.widget.php`,
    templates.wordpressWidget(element),
  )
}

export const createClientScript = async (element: VueElementorElement) => {
  await fs.writeFile(`elementor-dist/${element.name}/element.js`, await templates.clientScript(element))
}

export const createSSRScript = async (element: VueElementorElement) => {
  await fs.writeFile(`elementor-dist/${element.name}/ssr.js`, await templates.ssrScript(element))
}
