export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  nitro: {
    alias: {
      '#prisma': '/server/lib/prisma',
      '#db': '/app/generated/prisma/client',
    },
    typescript: {
      tsConfig: {
        compilerOptions: {
          paths: {
            '#prisma': ['../server/lib/prisma'],
            '#db': ['../app/generated/prisma/client'],
          },
        },
      },
    },
  },

  modules: ['@pinia/nuxt', 'nuxt-svg-icon-module', '@nuxt/eslint'],

  typescript: {
    strict: true,
    typeCheck: true,
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
