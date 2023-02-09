import c12 from 'c12'
import slugify from 'slugify'
import type { ZodError } from 'zod'
import type { VueElementorConfig } from './schema'
import { VueElementorConfigSchema, formatZodErrors } from './schema'

// eslint-disable-next-line import/no-mutable-exports
export let CONFIG: VueElementorConfig & { pluginNameSlug: string; version: string }

const readPackageJson = async () => {
  const packagesJsonPath = path.join(process.cwd(), 'package.json')
  const packagesJsonContents = await fs.readFile(packagesJsonPath, 'utf-8').then(data => data.toString())
  return JSON.parse(packagesJsonContents) as { version: string }
}

export const loadConfig = async () => {
  const configData = await c12.loadConfig({
    name: 'vue-elementor',
  })

  const validatedConfig = await VueElementorConfigSchema.parseAsync(configData.config).catch((err: ZodError) => {
    Log.error(`Config file not found or invalid:\n${formatZodErrors(err.errors)}`)
    process.exit(1)
  })

  CONFIG = {
    ...validatedConfig,
    pluginNameSlug: slugify(validatedConfig.wordpressPluginSettings.name, { lower: true, strict: true }),
    version: await readPackageJson().then(data => data.version),
  }
}
