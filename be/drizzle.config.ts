import { defineConfig } from 'drizzle-kit'

const databaseUrl = process.env.DATABASE_URL ?? './data/money-flow.db'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: databaseUrl
  },
  strict: true,
  verbose: true
})
