import { Router } from 'express'
import { entrar } from '../autenticacao/passport.js'
import { NOME_COOKIE } from '../autenticacao/sessao.js'
import { validarLogin } from '../validacoes/usuario.js'

/**
 * Entrada na aplicação. É pública: quem chama ainda não tem sessão.
 * `POST /api/sessao` com `{ nomeUsuario, senha }`.
 */
export function criarRotaDeEntrada() {
  const rotas = Router()

  rotas.post('/', (requisicao, resposta, proximo) => {
    const { credenciais, erros } = validarLogin(requisicao.body)

    if (erros) {
      return resposta.status(400).json({ mensagem: 'Dados inválidos.', erros })
    }

    requisicao.body = credenciais
    entrar(requisicao, resposta, proximo)
  })

  return rotas
}

/**
 * Sessão já aberta. Fica atrás de `autenticar`.
 * `GET /api/sessao` devolve o usuário; `DELETE /api/sessao` encerra a sessão.
 */
export function criarRotasSessao() {
  const rotas = Router()

  rotas.get('/', (requisicao, resposta) => {
    resposta.json(requisicao.user)
  })

  rotas.delete('/', (requisicao, resposta, proximo) => {
    requisicao.logout((erro) => {
      if (erro) return proximo(erro)

      requisicao.session.destroy((erroSessao) => {
        if (erroSessao) return proximo(erroSessao)

        resposta.clearCookie(NOME_COOKIE, { path: '/' })
        resposta.status(204).end()
      })
    })
  })

  return rotas
}
