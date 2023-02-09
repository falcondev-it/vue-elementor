import c12 from 'c12'
import slugify from 'slugify'
import type { ZodError } from 'zod'
import type { VueElementorConfig } from './schema'
import { VueElementorConfigSchema, formatZodErrors } from './schema'

// eslint-disable-next-line import/no-mutable-exports
export let CONFIG: VueElementorConfig & { pluginNameSlug: string }

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
  }
}
