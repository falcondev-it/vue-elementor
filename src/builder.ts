import fsExtra from 'fs-extra'
import vite from 'vite'
import pkg from 'pkg'
import type { VueElementorElement } from './schema'
import { createClientScript, createSSRScript } from './filesystem'
import { CONFIG } from './config'

export async function buildElement(element: VueElementorElement) {
  await fsExtra.ensureDir(`elementor-dist/${element.name}`)

  await Promise.all([
    createClientScript(element),
    createSSRScript(element),
  ])

  await Promise.all([
    buildClientScript(element),
    buildSSRBinary(element),
  ])
}

async function buildClientScript(element: VueElementorElement) {
  await runViteBuild(`elementor-dist/${element.name}/element.js`, `${element.name}.el.js`)
  await fsExtra.copy(
    `dist/${element.name}.el.js`,
    `${CONFIG.pluginNameSlug}/assets/${element.name}.el.js`,
  )
}
async function buildSSRBinary(element: VueElementorElement) {
  await runViteBuild(`elementor-dist/${element.name}/ssr.js`, `${element.name}.ssr.js`)

  const arch = `${CONFIG.ssrBinaryTarget.node}-${CONFIG.ssrBinaryTarget.platform}-${CONFIG.ssrBinaryTarget.arch}`
  await pkg.exec([
    `dist/${element.name}.ssr.js`,
    '-C',
    'GZip',
    '--target',
    arch,
    '--output',
    `${CONFIG.pluginNameSlug}/assets/${element.name}.ssr`,
  ])
}

async function runViteBuild(entry: string, fileName: string) {
  return vite.build({
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
