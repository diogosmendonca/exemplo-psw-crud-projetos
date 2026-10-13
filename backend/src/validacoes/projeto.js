import { schemaProjeto } from '@gerenciador-de-projetos/compartilhado'

/**
 * Valida e normaliza o corpo recebido para criar ou alterar um projeto, com o
 * mesmo schema (zod) que o formulário do front-end usa.
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
