import { Router } from 'express'
import { cadastrar, configurarCadastro } from '../autenticacao/passport.js'
import { validarRegistro } from '../validacoes/usuario.js'

/**
 * Registro público, a partir da tela de entrar. Não exige token.
 * O perfil enviado pelo cliente é ignorado: a conta nasce como gerente.
 *
 * @param {import('../dao/UsuarioDAO.js').UsuarioDAO} usuarios
 */
export function criarRotaDeRegistro(usuarios) {
  configurarCadastro(usuarios)

  const rotas = Router()

  rotas.post('/', (requisicao, resposta, proximo) => {
    const { usuario, erros } = validarRegistro(requisicao.body)

    if (erros) {
      return resposta.status(400).json({ mensagem: 'Usuário inválido.', erros })
    }

    requisicao.body = { ...usuario, perfil: 'gerente' }
    cadastrar(requisicao, resposta, proximo)
  })

  return rotas
}
