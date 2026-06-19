import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: ['tests/ui/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '#prisma': resolve(__dirname, '../server/lib/prisma'),
      '#db': resolve(__dirname, '../app/generated/prisma/client'),
      '#server': resolve(__dirname, '../server/lib'),
    },
  },
})
