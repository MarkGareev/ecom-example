/// <reference types="node" />
import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { resolve } from 'node:path'

const root = resolve(__dirname, '..')

export default defineConfig({
  schema: resolve(root, 'prisma/schema.prisma'),
  migrations: {
    path: resolve(root, 'prisma/migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
