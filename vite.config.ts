import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// Static site, no server and no API. Build output: dist/
export default defineConfig({
  root: resolve(__dirname, 'threeyear-site'),
  base: '/',
  publicDir: false, // the CSS references the font files by relative url, so only those files are bundled
  server: { fs: { allow: ['..'] } },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false }, // the polyfill uses fetch(); modern browsers preload natively
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@orrery/core', replacement: resolve(__dirname, 'packages/core/src') },
      // Swap the i18n module (localStorage access, 4 languages) for a fixed Korean one.
      { find: /^(\.\.?\/)+i18n\/index\.ts$/, replacement: resolve(__dirname, 'threeyear-site/i18n-ko.ts') },
    ],
  },
})
