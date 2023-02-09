import { buildElement } from './builder'
import { CONFIG, loadConfig } from './config'
import { cleanupTempFolders, createBuildFolders, createWordpressPluginFile, createWordpressWidgetFile } from './filesystem'
import './logger'

export const main = async () => {
  await loadConfig()

  await createBuildFolders()

  await createWordpressPluginFile()

  await Promise.all([
    CONFIG.elements.map(async (element) => {
      await createWordpressWidgetFile(element)
      await buildElement(element)
    }),
  ])

  await cleanupTempFolders()
}

main()
