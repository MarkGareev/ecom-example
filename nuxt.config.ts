import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  nitro: {
    alias: {
      '#prisma': fileURLToPath(new URL('./server/lib/prisma.ts', import.meta.url)),
      '#db': fileURLToPath(new URL('./app/generated/prisma/client.ts', import.meta.url)),
      '#server': fileURLToPath(new URL('./server/lib', import.meta.url)),
    },
  },

  modules: ['@pinia/nuxt', 'nuxt-svg-icon-module', '@nuxt/eslint', '@scalar/nuxt'],

  scalar: {
    pathRouting: { basePath: '/api-docs' },
    openApiUrl: '/api/openapi.json',
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  css: ['~/assets/styles/main.scss'],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // variables and mixins available in every component without importing
          additionalData:
            '@use "~/assets/styles/variables" as *; @use "~/assets/styles/mixins" as *;',
        },
      },
    },
  },
})
