import { ProjetoDAO } from '../ProjetoDAO.js'
import { paraCliente } from './ClienteDAOPostgres.js'

// Maior valor de uma coluna `integer` do PostgreSQL.
const MAIOR_ID = 2_147_483_647

/**
 * O id chega da URL como texto; no PostgreSQL ele é um número sequencial.
 * Devolve o número, ou `null` se o texto não for um id possível (o projeto é
 * tratado como inexistente e a API responde 404).
 */
function paraId(id) {
  if (typeof id !== 'string' || !/^\d+$/.test(id)) return null

  const numero = Number(id)

  return numero >= 1 && numero <= MAIOR_ID ? numero : null
}

/** Registro do Prisma (com o cliente incluído) → projeto no formato da API. */
function paraProjeto(registro) {
  return {
    id: String(registro.id),
    nome: registro.nome,
    status: registro.status,
    cliente: registro.cliente ? paraCliente(registro.cliente) : null,
    descricao: registro.descricao,
    tecnologias: registro.tecnologias,
    url: registro.url,
  }
}

const COM_CLIENTE = { include: { cliente: true } }

export class ProjetoDAOPostgres extends ProjetoDAO {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   * @param {import('../ClienteDAO.js').ClienteDAO} clientes
   */
  constructor(prisma, clientes) {
    super()
    this.prisma = prisma
    this.clientes = clientes
  }

  /** Troca `cliente: { nome }` pela chave estrangeira, criando o cliente se for novo. */
  async #paraRegistro({ cliente, ...dados }) {
    if (!cliente) return { ...dados, clienteId: null }

    const { id } = await this.clientes.obterOuCriar(cliente.nome)

    return { ...dados, clienteId: Number(id) }
  }

  async listar() {
    const projetos = await this.prisma.projeto.findMany({ orderBy: { id: 'asc' }, ...COM_CLIENTE })

    return projetos.map(paraProjeto)
  }

  async buscarPorId(id) {
    const numero = paraId(id)
    if (numero === null) return null

    const projeto = await this.prisma.projeto.findUnique({ where: { id: numero }, ...COM_CLIENTE })

    return projeto ? paraProjeto(projeto) : null
  }

  async criar(dados) {
    const projeto = await this.prisma.projeto.create({
      data: await this.#paraRegistro(dados),
      ...COM_CLIENTE,
    })

    return paraProjeto(projeto)
  }

  async alterar(id, dados) {
    const numero = paraId(id)
    if (numero === null) return null

    try {
      // Os dados validados trazem todos os campos (com os padrões aplicados),
      // então o `update` substitui o projeto inteiro (semântica do PUT).
      const projeto = await this.prisma.projeto.update({
        where: { id: numero },
        data: await this.#paraRegistro(dados),
        ...COM_CLIENTE,
      })

      return paraProjeto(projeto)
    } catch (erro) {
      // P2025: nenhum registro com esse id.
      if (erro.code === 'P2025') return null
      throw erro
    }
  }

  async excluir(id) {
    const numero = paraId(id)
    if (numero === null) return false

    const { count } = await this.prisma.projeto.deleteMany({ where: { id: numero } })

    return count > 0
  }
}
