import { defineVitestConfig } from '@nuxt/test-utils/config'
import { resolve } from 'path'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        rootDir: resolve(__dirname, '..'),
      },
    },
    globals: true,
    include: ['tests/ui/**/*.test.ts'],
  },
})
