import fs from 'fs-extra'
import { build } from 'vite'
import { exec as pkg } from 'pkg'
import type { VueElementorElement } from './schema'
import { elementTemplate, ssrScriptTemplate } from './templates'

export async function buildElement(element: VueElementorElement, arch: string) {
  await fs.ensureDir(`elementor-dist/${element.name}`)

  await fs.writeFile(`elementor-dist/${element.name}/element.js`, await elementTemplate(element))

  await fs.writeFile(`elementor-dist/${element.name}/ssr.js`, await ssrScriptTemplate(element))

  await viteBuild(`elementor-dist/${element.name}/element.js`, `${element.name}.el.js`)
  await fs.copy(
    `dist/${element.name}.el.js`,
    `wordpress-plugin/assets/${element.name}.el.js`,
  )

  await viteBuild(`elementor-dist/${element.name}/ssr.js`, `${element.name}.ssr.js`)
  await pkg([
    `dist/${element.name}.ssr.js`,
    '--target',
    arch,
    '--output',
    `wordpress-plugin/assets/${element.name}.ssr`,
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
