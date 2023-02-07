import { writeFile } from 'node:fs/promises'
import fs from 'fs-extra'
import { build } from 'vite'
import { exec as pkg } from 'pkg'
import type { VueElementorElement } from './schema'
import { elementTemplate, ssrScriptTemplate } from './templates'

export async function buildElement(element: VueElementorElement, arch: string, pluginName: string) {
  await fs.ensureDir(`elementor-dist/${element.name}`)

  await writeFile(`elementor-dist/${element.name}/element.js`, await elementTemplate(element))

  await writeFile(`elementor-dist/${element.name}/ssr.js`, await ssrScriptTemplate(element))

  await viteBuild(`elementor-dist/${element.name}/element.js`, `${element.name}.el.js`)
  await fs.copy(
    `dist/${element.name}.el.js`,
    `${pluginName}/assets/${element.name}.el.js`,
  )

  await viteBuild(`elementor-dist/${element.name}/ssr.js`, `${element.name}.ssr.js`)
  await pkg([
    `dist/${element.name}.ssr.js`,
    '--target',
    arch,
    '--output',
    `${pluginName}/assets/${element.name}.ssr`,
  ])
}

export async function viteBuild(entry: string, fileName: string) {
  return build({
    configFile: 'vite.config.ts',
    build: {
      lib: {
        entry,
        formats: ['es'],
        fileName: () => fileName,
      },
    },
  })
}
