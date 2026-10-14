import { ClienteDAO } from '../ClienteDAO.js'

/** Registro do Prisma → cliente no formato da API (o `id` numérico vira texto). */
export function paraCliente(registro) {
  return { id: String(registro.id), nome: registro.nome }
}

/**
 * Chave usada para achar o cliente pelo nome sem diferenciar maiúsculas:
 * "Acme" e "ACME" têm a mesma chave. A coluna `nome_chave` é única.
 */
function chaveDoNome(nome) {
  return nome.toLocaleLowerCase('pt-BR')
}

export class ClienteDAOPostgres extends ClienteDAO {
  /** @param {import('@prisma/client').PrismaClient} prisma */
  constructor(prisma) {
    super()
    this.prisma = prisma
  }

  async listar() {
    const clientes = await this.prisma.cliente.findMany({ orderBy: { nomeChave: 'asc' } })

    return clientes.map(paraCliente)
  }

  async obterOuCriar(nome) {
    const nomeChave = chaveDoNome(nome)

    try {
      // Vira um único `INSERT ... ON CONFLICT` no PostgreSQL: busca ou cria sem
      // duplicar, mesmo com dois pedidos simultâneos. `update: {}` mantém o nome
      // com a grafia da primeira vez.
      const cliente = await this.prisma.cliente.upsert({
        where: { nomeChave },
        update: {},
        create: { nome, nomeChave },
      })

      return paraCliente(cliente)
    } catch (erro) {
      // P2002 (valor único repetido): outra requisição criou o mesmo cliente no
      // meio do caminho. Ele já existe, então basta buscá-lo.
      if (erro.code !== 'P2002') throw erro

      return paraCliente(await this.prisma.cliente.findUnique({ where: { nomeChave } }))
    }
  }
}
