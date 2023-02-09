import type { Consola } from 'consola'
import consola from 'consola'

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var Log: Consola
}

(globalThis as any).Log = consola.create({
  level: Infinity,
})
