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

/** Registro do Prisma (com cliente e gerente incluídos) → projeto no formato da API. */
function paraProjeto(registro) {
  return {
    id: String(registro.id),
    nome: registro.nome,
    status: registro.status,
    cliente: registro.cliente ? paraCliente(registro.cliente) : null,
    descricao: registro.descricao,
    tecnologias: registro.tecnologias,
    url: registro.url,
    gerente: registro.gerente
      ? { id: String(registro.gerente.id), nome: registro.gerente.nome }
      : null,
  }
}

const COM_RELACOES = { include: { cliente: true, gerente: true } }

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

  /** Troca `cliente: { nome }` e `gerenteId` pelas chaves estrangeiras. */
  async #paraRegistro({ cliente, gerenteId, ...dados }) {
    const registro = { ...dados, gerenteId: gerenteId ? Number(gerenteId) : null }

    if (!cliente) return { ...registro, clienteId: null }

    const { id } = await this.clientes.obterOuCriar(cliente.nome)

    return { ...registro, clienteId: Number(id) }
  }

  async listar(gerenteId) {
    const numero = gerenteId ? paraId(gerenteId) : undefined
    if (gerenteId && numero === null) return []

    const projetos = await this.prisma.projeto.findMany({
      where: numero ? { gerenteId: numero } : undefined,
      orderBy: { id: 'asc' },
      ...COM_RELACOES,
    })

    return projetos.map(paraProjeto)
  }

  async buscarPorId(id) {
    const numero = paraId(id)
    if (numero === null) return null

    const projeto = await this.prisma.projeto.findUnique({ where: { id: numero }, ...COM_RELACOES })

    return projeto ? paraProjeto(projeto) : null
  }

  async criar(dados) {
    const projeto = await this.prisma.projeto.create({
      data: await this.#paraRegistro(dados),
      ...COM_RELACOES,
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
        ...COM_RELACOES,
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

  async existeDoGerente(gerenteId) {
    const numero = paraId(gerenteId)
    if (numero === null) return false

    const quantidade = await this.prisma.projeto.count({ where: { gerenteId: numero } })

    return quantidade > 0
  }
}
