import { Router } from 'express'
import { cadastrar, configurarCadastro } from '../autenticacao/passport.js'
import { validarUsuario } from '../validacoes/usuario.js'

/**
 * Rota de cadastro de usuários. O DAO não é importado: a aplicação entrega o
 * do banco escolhido. A senha é tratada pela estratégia de cadastro do Passport.
 *
 * @param {import('../dao/UsuarioDAO.js').UsuarioDAO} usuarios
 */
export function criarRotasUsuarios(usuarios) {
  configurarCadastro(usuarios)

  const rotas = Router()

  // POST /usuarios - cadastra um usuário. Ainda não há login nem listagem.
  rotas.post('/', (requisicao, resposta, proximo) => {
    const { usuario, erros } = validarUsuario(requisicao.body)

    if (erros) {
      return resposta.status(400).json({ mensagem: 'Usuário inválido.', erros })
    }

    // O Passport lê o corpo. Substitui pelo que o schema normalizou.
    requisicao.body = usuario
    cadastrar(requisicao, resposta, proximo)
  })

  return rotas
}
