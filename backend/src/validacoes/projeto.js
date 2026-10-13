import { z } from 'zod'
import { criarSchemasProjeto } from '../../../compartilhado/projeto.js'

// As regras ficam em `compartilhado/projeto.js`, as mesmas do formulário do front-end.
const { projeto: schemaProjeto } = criarSchemasProjeto(z)

/**
 * Valida e normaliza o corpo recebido para criar ou alterar um projeto.
 * Devolve `{ erros }` (lista de mensagens, sem repetição) ou `{ projeto }` com
 * os campos já tratados. Campos desconhecidos, inclusive `id`, são descartados.
 *
 * O cliente é opcional e vem como `{ "nome": "Acme" }` (ou `null`). O projeto
 * devolvido tem `cliente: { nome } | null`.
 */
export function validarProjeto(corpo) {
  const resultado = schemaProjeto.safeParse(corpo)

  if (resultado.success) return { projeto: resultado.data }

  return { erros: [...new Set(resultado.error.issues.map((problema) => problema.message))] }
}
