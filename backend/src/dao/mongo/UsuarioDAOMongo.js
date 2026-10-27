import { UsuarioDAO, UsuarioJaCadastrado } from '../UsuarioDAO.js'
import { COLLATION_NOME } from './modelos/cliente.js'
import { Usuario } from './modelos/usuario.js'

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

  async buscarParaAutenticacao(nomeUsuario) {
    const documento = await Usuario.findOne({ nomeUsuario }).collation(COLLATION_NOME).lean()

    if (!documento) return null

    return { ...paraUsuario(documento), senhaHash: documento.senhaHash }
  }
}
