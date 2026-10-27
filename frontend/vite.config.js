import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // A API fica na mesma origem do front-end. O JWT vai no cabeçalho
    // Authorization das chamadas em /api.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // O Bootstrap 5.3 ainda usa `@import` e funções Sass antigas.
        // Silencia apenas os avisos de depreciação vindos do próprio Bootstrap.
        quietDeps: true,
        silenceDeprecations: [
          'import',
          'global-builtin',
          'color-functions',
          'if-function',
        ],
      },
    },
  },
})
