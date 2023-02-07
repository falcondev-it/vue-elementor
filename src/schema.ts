import { z } from 'zod'

export const VueElementorElementSchema = z.object({
  name: z.string(),
  component: z.string(),
})

export type VueElementorElement = z.infer<typeof VueElementorElementSchema>

export const VueElementorConfigSchema = z.object({
  elements: z.array(VueElementorElementSchema),
  wordpressArchitecture: z.string(),
  pluginName: z.string(),
})

export type VueElementorConfig = z.infer<typeof VueElementorConfigSchema>
