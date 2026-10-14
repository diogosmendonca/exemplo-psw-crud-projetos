import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { ambiente } from '../../config/ambiente.js'
import { enderecoSemSenha } from '../enderecoSemSenha.js'

// Se o PostgreSQL não responder neste tempo, a conexão falha.
const TEMPO_LIMITE_MS = 5000

// No Prisma 7 o cliente fala com o banco por um "driver adapter"; para o
// PostgreSQL é o `pg` (node-postgres), via `@prisma/adapter-pg`.
export const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: ambiente.postgresUrl,
    connectionTimeoutMillis: TEMPO_LIMITE_MS,
  }),
})

/**
 * Conecta ao PostgreSQL e confere se as tabelas existem. Falha com uma
 * mensagem clara (sem expor a senha) se o banco não responder ou se as
 * migrações ainda não foram aplicadas.
 */
export async function conectarPostgres() {
  let tabela

  try {
    // `$connect` sozinho não garante a conexão: a consulta é que a testa.
    ;[{ tabela }] = await prisma.$queryRaw`SELECT to_regclass('public.projetos')::text AS tabela`
  } catch (erro) {
    // As mensagens do Prisma começam com várias linhas sobre a chamada; o
    // motivo da falha fica na última. Se ela não tiver motivo (ex.: conexão
    // recusada), o código do erro (ex.: ECONNREFUSED) diz o que houve.
    const ultimaLinha = erro.message.trim().split('\n').at(-1)
    const motivo = ultimaLinha.startsWith('Invalid `prisma.') ? erro.code : ultimaLinha

    throw new Error(
      `Não foi possível conectar ao PostgreSQL em ${enderecoSemSenha(ambiente.postgresUrl)} ` +
        `(${motivo}). Verifique se ele está em execução e se POSTGRES_URL está correta.`,
      { cause: erro },
    )
  }

  if (!tabela) {
    throw new Error(
      'O PostgreSQL está acessível, mas as tabelas não existem. ' +
        'Crie-as com "npm run prisma:migrar" (na pasta backend).',
    )
  }
}

export async function desconectarPostgres() {
  await prisma.$disconnect()
}
