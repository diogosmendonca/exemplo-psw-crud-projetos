import { UsuarioDAO, UsuarioJaCadastrado } from '../UsuarioDAO.js'
import { COLLATION_NOME } from './modelos/cliente.js'
import { Usuario } from './modelos/usuario.js'

function idValido(id) {
  return typeof id === 'string' && /^[0-9a-f]{24}$/i.test(id)
}

/** Documento do MongoDB → usuário no formato da API, sem a senha. */
function paraUsuario(documento) {
  return {
    id: String(documento._id),
    nome: documento.nome,
    email: documento.email,
    nomeUsuario: documento.nomeUsuario,
    perfil: documento.perfil,
  }
}

export class UsuarioDAOMongo extends UsuarioDAO {
  async criar(dados) {
    try {
      const usuario = await Usuario.create(dados)

      return paraUsuario(usuario)
    } catch (erro) {
      // 11000 (chave duplicada): e-mail ou nome de usuário já cadastrado.
      if (erro.code !== 11000) throw erro

      const campo = erro.keyPattern?.email ? 'email' : 'nomeUsuario'
      throw new UsuarioJaCadastrado(campo)
    }
  }

  async listar() {
    const documentos = await Usuario.find().collation(COLLATION_NOME).sort({ nome: 1 }).lean()

    return documentos.map(paraUsuario)
  }

  async buscarParaAutenticacao(nomeUsuario) {
    const documento = await Usuario.findOne({ nomeUsuario }).collation(COLLATION_NOME).lean()

    if (!documento) return null

    return { ...paraUsuario(documento), senhaHash: documento.senhaHash }
  }

  async buscarPorId(id) {
    if (!idValido(id)) return null

    const documento = await Usuario.findById(id).lean()

    return documento ? paraUsuario(documento) : null
  }

  async alterar(id, dados) {
    if (!idValido(id)) return null

    const atualizacao = { ...dados }
    if (!atualizacao.senhaHash) delete atualizacao.senhaHash

    try {
      const documento = await Usuario.findByIdAndUpdate(id, atualizacao, {
        new: true,
        runValidators: true,
      }).lean()

      return documento ? paraUsuario(documento) : null
    } catch (erro) {
      if (erro.code !== 11000) throw erro

      const campo = erro.keyPattern?.email ? 'email' : 'nomeUsuario'
      throw new UsuarioJaCadastrado(campo)
    }
  }

  async excluir(id) {
    if (!idValido(id)) return false

    const documento = await Usuario.findByIdAndDelete(id)

    return Boolean(documento)
  }
}
