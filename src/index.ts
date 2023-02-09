import { buildElement } from './builder'
import { CONFIG, loadConfig } from './config'
import { cleanupTempFolders, createBuildFolders, createWordpressPluginFile, createWordpressWidgetFile } from './filesystem'
import './logger'

export const main = async () => {
  await loadConfig()

  await createBuildFolders()

  await createWordpressPluginFile()

  for (const element of CONFIG.elements) {
    await createWordpressWidgetFile(element)
    await buildElement(element)
  }

  await cleanupTempFolders()
}
