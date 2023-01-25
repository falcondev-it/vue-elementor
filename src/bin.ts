#!/usr/bin/env node
import { loadConfig } from 'c12'

const { config } = await loadConfig({
  name: 'vue-elementor',
})
