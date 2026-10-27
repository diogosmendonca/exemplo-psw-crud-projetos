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

  async buscarParaAutenticacao(nomeUsuario) {
    const registro = await this.prisma.usuario.findUnique({
      where: { nomeUsuarioChave: chaveDoNomeUsuario(nomeUsuario) },
    })

    if (!registro) return null

    return { ...paraUsuario(registro), senhaHash: registro.senhaHash }
  }
}
