import { UsuarioDAO, UsuarioJaCadastrado } from '../UsuarioDAO.js'

/** Registro do Prisma → usuário no formato da API (o `id` numérico vira texto). */
function paraUsuario(registro) {
  return {
    id: String(registro.id),
    nome: registro.nome,
    email: registro.email,
    nomeUsuario: registro.nomeUsuario,
    perfil: registro.perfil,
  }
}

/**
 * Chave do nome de usuário sem diferenciar maiúsculas: "Ana" e "ana" têm a
 * mesma chave. A coluna `nome_usuario_chave` é única.
 */
function chaveDoNomeUsuario(nomeUsuario) {
  return nomeUsuario.toLocaleLowerCase('pt-BR')
}

/** Id da API (texto) → inteiro da tabela, ou `null` se o formato não serve. */
function idNumerico(id) {
  if (typeof id !== 'string' || !/^\d+$/.test(id)) return null

  const numero = Number(id)
  if (numero < 1 || numero > 2_147_483_647) return null

  return numero
}

/**
 * Descobre qual campo único o PostgreSQL recusou (P2002). Com o adaptador do
 * Prisma 7 o nome do índice vem em `driverAdapterError`, não em `meta.target`.
 */
function campoDuplicado(erro) {
  const alvo = erro.meta?.target
  const indice = erro.meta?.driverAdapterError?.cause?.constraint?.index
  const texto = [alvo, indice].flat().filter(Boolean).join(' ')

  return texto.includes('email') ? 'email' : 'nomeUsuario'
}

export class UsuarioDAOPostgres extends UsuarioDAO {
  /** @param {import('@prisma/client').PrismaClient} prisma */
  constructor(prisma) {
    super()
    this.prisma = prisma
  }

  async criar({ nomeUsuario, ...dados }) {
    try {
      const usuario = await this.prisma.usuario.create({
        data: { ...dados, nomeUsuario, nomeUsuarioChave: chaveDoNomeUsuario(nomeUsuario) },
      })

      return paraUsuario(usuario)
    } catch (erro) {
      if (erro.code !== 'P2002') throw erro

      throw new UsuarioJaCadastrado(campoDuplicado(erro))
    }
  }

  async listar() {
    const registros = await this.prisma.usuario.findMany({ orderBy: { nome: 'asc' } })

    return registros.map(paraUsuario)
  }

  async buscarParaAutenticacao(nomeUsuario) {
    const registro = await this.prisma.usuario.findUnique({
      where: { nomeUsuarioChave: chaveDoNomeUsuario(nomeUsuario) },
    })

    if (!registro) return null

    return { ...paraUsuario(registro), senhaHash: registro.senhaHash }
  }

  async buscarPorId(id) {
    const numero = idNumerico(id)
    if (!numero) return null

    const registro = await this.prisma.usuario.findUnique({ where: { id: numero } })

    return registro ? paraUsuario(registro) : null
  }

  async alterar(id, { nomeUsuario, senhaHash, ...dados }) {
    const numero = idNumerico(id)
    if (!numero) return null

    try {
      const registro = await this.prisma.usuario.update({
        where: { id: numero },
        data: {
          ...dados,
          nomeUsuario,
          nomeUsuarioChave: chaveDoNomeUsuario(nomeUsuario),
          ...(senhaHash ? { senhaHash } : {}),
        },
      })

      return paraUsuario(registro)
    } catch (erro) {
      if (erro.code === 'P2025') return null
      if (erro.code !== 'P2002') throw erro

      throw new UsuarioJaCadastrado(campoDuplicado(erro))
    }
  }

  async excluir(id) {
    const numero = idNumerico(id)
    if (!numero) return false

    try {
      await this.prisma.usuario.delete({ where: { id: numero } })
      return true
    } catch (erro) {
      if (erro.code === 'P2025') return false
      throw erro
    }
  }
}
