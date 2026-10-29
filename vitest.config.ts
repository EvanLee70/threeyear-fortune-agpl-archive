import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: { '@orrery/core': resolve(__dirname, 'packages/core/src') },
  },
})
