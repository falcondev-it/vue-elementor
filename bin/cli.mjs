#!/usr/bin/env node
import('../dist/index.mjs').then(r => (r.default || r).main())
