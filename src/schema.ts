import type { ZodIssue } from 'zod'
import { z } from 'zod'

export const VueElementorElementSchema = z.object({
  name: z.string(),
  component: z.string(),
})

export type VueElementorElement = z.infer<typeof VueElementorElementSchema>

export const VueElementorConfigSchema = z.object({
  elements: z.array(VueElementorElementSchema),
  ssrBinaryTarget: z.object({
    node: z.enum(['latest', '12', '14', '16']),
    platform: z.enum(['linux', 'macos', 'win', 'alpine']),
    arch: z.enum(['x64', 'arm64']),
  }),
  wordpressPluginSettings: z.object({
    name: z.string(),
    templateFile: z.string().optional(),
    widgetSettings: z.array(z.object({
      id: z.string(),
      options: z.any(),
      controls: z.array(z.object({
        responsive: z.boolean().optional(),
        name: z.string(),
        options: z.any(),
      })),
    })).optional(),
  }),
})

export type VueElementorConfig = z.infer<typeof VueElementorConfigSchema>

export function formatZodErrors(issues: ZodIssue[]) {
  return issues.map((issue) => {
    return `Property ${issue.path.join('.')}: ${issue.message}`
  }).join('\n')
}
