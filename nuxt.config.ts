export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', 'nuxt-svg-icon-module', '@nuxt/eslint'],

  typescript: {
    strict: true,
    typeCheck: true,
  },
})
