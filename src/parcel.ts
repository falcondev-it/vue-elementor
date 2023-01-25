import { readFile } from 'fs/promises'
import { Parcel, createWorkerFarm } from '@parcel/core'
import { MemoryFS } from '@parcel/fs'
import { widgetClientScriptTemplate } from './templates/elementor'

export const buildWidgetClientScript = async (componentPath: string) => {
  const workerFarm = createWorkerFarm()
  const fs = new MemoryFS(workerFarm)
  fs.writeFile('client.js', widgetClientScriptTemplate(), undefined)
  fs.writeFile('component.vue', await readFile(componentPath), undefined)

  const bundler = new Parcel({
    targets: {
      default: {
        distDir: 'dist',
        context: 'browser',
        source: './client.ts',
        includeNodeModules: {
          vue: false,
        },
      },
    },
    inputFS: fs,
    outputFS: fs,
  })

  const { bundleGraph } = await bundler.run()
  const scriptContent = fs.readFile(bundleGraph.getBundles()[0]?.filePath ?? '', 'utf8')
  await workerFarm.end()
  return scriptContent
}
