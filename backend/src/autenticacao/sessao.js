import session from 'express-session'
import { ambiente } from '../config/ambiente.js'

/** Nome do cookie que o navegador devolve em toda requisição depois do login. */
export const NOME_COOKIE = 'sessao'

// O login dura 8 horas. A sessão fica na memória deste processo: reiniciar a
// API desconecta todo mundo. Não há um banco de sessões.
const DURACAO_MS = 8 * 60 * 60 * 1000

/**
 * Middleware de sessão. O cookie guarda só o id da sessão; o id do usuário
 * fica no servidor. `httpOnly` impede o JavaScript da página de ler o cookie.
 */
export function sessao() {
  return session({
    name: NOME_COOKIE,
    secret: ambiente.segredoDaSessao,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.SESSION_COOKIE_SECURE === 'true',
      maxAge: DURACAO_MS,
    },
  })
}
