import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [vue(), UnoCSS()],

  build: {
    outDir: 'dist',
    manifest: true,

    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vue-core',
              test: /node_modules\/(?:vue|vue-router)\//,
              priority: 20,
            },
            {
              name: 'calculator',
              test: /src\/components\/calculator\//,
              priority: 10,
            },
          ],
        },
      },
    },
  },

  server: {
    host: true,
    open: true,
  },
})
