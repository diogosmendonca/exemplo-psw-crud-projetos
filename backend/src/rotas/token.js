import { Router } from 'express'
import { entrar } from '../autenticacao/passport.js'
import { validarLogin } from '../validacoes/usuario.js'

/**
 * Entrada na aplicação. É pública: quem chama ainda não tem token.
 * `POST /api/token` com `{ nomeUsuario, senha }` devolve `{ token, usuario }`.
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
 * Usuário do JWT já conferido. Fica atrás de `autenticar`.
 * `GET /api/token` devolve o usuário. Sair é apagar o token no navegador:
 * o servidor não guarda sessão para encerrar.
 */
export function criarRotaDoToken() {
  const rotas = Router()

  rotas.get('/', (requisicao, resposta) => {
    resposta.json(requisicao.user)
  })

  return rotas
}
