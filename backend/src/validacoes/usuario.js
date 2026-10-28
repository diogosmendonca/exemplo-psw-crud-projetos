import {
  schemaLogin,
  schemaRegistro,
  schemaUsuario,
  schemaUsuarioAlteracao,
} from '@gerenciador-de-projetos/compartilhado'

/**
 * Valida e normaliza o corpo recebido para cadastrar um usuário, com o mesmo
 * schema (zod) que o formulário do front-end usa.
 * Devolve `{ erros }` (lista de mensagens, sem repetição) ou `{ usuario }` com
 * os campos já tratados (e-mail em minúsculas, textos sem espaços nas pontas).
 * Campos desconhecidos, inclusive `id` e a confirmação da senha, são descartados.
 */
export function validarUsuario(corpo) {
  const resultado = schemaUsuario.safeParse(corpo)

  if (resultado.success) return { usuario: resultado.data }

  return { erros: [...new Set(resultado.error.issues.map((problema) => problema.message))] }
}

/** Registro público. O perfil não faz parte do corpo. */
export function validarRegistro(corpo) {
  const resultado = schemaRegistro.safeParse(corpo)

  if (resultado.success) return { usuario: resultado.data }

  return { erros: [...new Set(resultado.error.issues.map((problema) => problema.message))] }
}

/** Alteração. A senha pode vir vazia: nesse caso ela não é trocada. */
export function validarAlteracao(corpo) {
  const resultado = schemaUsuarioAlteracao.safeParse(corpo)

  if (resultado.success) return { usuario: resultado.data }

  return { erros: [...new Set(resultado.error.issues.map((problema) => problema.message))] }
}

/** Valida o corpo do login. Devolve `{ erros }` ou `{ credenciais }`. */
export function validarLogin(corpo) {
  const resultado = schemaLogin.safeParse(corpo)

  if (resultado.success) return { credenciais: resultado.data }

  return { erros: [...new Set(resultado.error.issues.map((problema) => problema.message))] }
}
