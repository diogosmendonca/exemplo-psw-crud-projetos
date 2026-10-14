import { defineConfig } from 'prisma/config'
import { ambiente } from './src/config/ambiente.js'

// Configuração da CLI do Prisma (generate, migrate, studio). O endereço vem de
// POSTGRES_URL, lida do `.env` pelo mesmo módulo que configura a API.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: ambiente.postgresUrl,
  },
})
