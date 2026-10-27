import jwt from 'jsonwebtoken'
import { ambiente } from '../config/ambiente.js'

// O token vale 8 horas. Depois disso a estratégia JWT recusa e a pessoa entra de novo.
const DURACAO = '8h'

/**
 * Assina um JWT com o id do usuário (`sub`). A senha não entra no token.
 * O navegador devolve este texto no cabeçalho `Authorization: Bearer`.
 *
 * @param {{ id: string }} usuario
 * @returns {string}
 */
export function gerarToken(usuario) {
  return jwt.sign({ sub: usuario.id }, ambiente.segredoDoJwt, { expiresIn: DURACAO })
}
