import { z } from 'zod'

/**
 * Regras do usuário, as mesmas no front-end e no back-end.
 *
 * A senha entra em texto aqui para ser validada. Quem grava troca ela por um
 * hash e ela nunca volta na resposta. O registro público não escolhe perfil:
 * a API grava sempre Gerente de Projetos. O CRUD completo é do administrador.
 */

export const PERFIS_USUARIO = ['administrador', 'gerente']

/** Texto do perfil na tela. O valor gravado é o de `PERFIS_USUARIO`. */
export const ROTULO_PERFIL_USUARIO = {
  administrador: 'Administrador',
  gerente: 'Gerente de Projetos',
}

export const TAMANHO_MAXIMO_NOME_USUARIO = 100
export const TAMANHO_MAXIMO_NOME_DE_USUARIO = 50
const TAMANHO_MINIMO_SENHA = 8
// O bcrypt só considera os primeiros 72 bytes da senha.
const TAMANHO_MAXIMO_SENHA = 72

const mensagemNome = 'Informe o nome.'
const mensagemNomeDeUsuario = 'Informe o nome de usuário.'
const mensagemSenha = `A senha deve ter de ${TAMANHO_MINIMO_SENHA} a ${TAMANHO_MAXIMO_SENHA} caracteres.`

/** Nome de usuário e senha da tela de entrada. A senha não tem tamanho mínimo aqui: quem já cadastrou entra com a senha que gravou. */
export const schemaLogin = z.object(
  {
    nomeUsuario: z
      .string({ error: 'Informe o nome de usuário.' })
      .trim()
      .min(1, 'Informe o nome de usuário.'),
    senha: z.string({ error: 'Informe a senha.' }).min(1, 'Informe a senha.'),
  },
  { error: 'O corpo da requisição deve ser um objeto JSON com o nome de usuário e a senha.' },
)

export const schemaUsuario = z.object(
  {
    nome: z
      .string({ error: mensagemNome })
      .trim()
      .min(1, mensagemNome)
      .max(
        TAMANHO_MAXIMO_NOME_USUARIO,
        `O nome deve ter até ${TAMANHO_MAXIMO_NOME_USUARIO} caracteres.`,
      ),
    email: z
      .string({ error: 'Informe o e-mail.' })
      .trim()
      .toLowerCase()
      .max(254, 'O e-mail deve ter até 254 caracteres.')
      .refine((valor) => z.email().safeParse(valor).success, 'Informe um e-mail válido.'),
    nomeUsuario: z
      .string({ error: mensagemNomeDeUsuario })
      .trim()
      .min(3, 'O nome de usuário deve ter pelo menos 3 caracteres.')
      .max(
        TAMANHO_MAXIMO_NOME_DE_USUARIO,
        `O nome de usuário deve ter até ${TAMANHO_MAXIMO_NOME_DE_USUARIO} caracteres.`,
      )
      .refine((valor) => !/\s/.test(valor), 'O nome de usuário não pode ter espaços.'),
    senha: z
      .string({ error: 'Informe a senha.' })
      .min(TAMANHO_MINIMO_SENHA, mensagemSenha)
      .max(TAMANHO_MAXIMO_SENHA, mensagemSenha),
    perfil: z.enum(PERFIS_USUARIO, {
      error: `Informe o perfil de acesso (${Object.values(ROTULO_PERFIL_USUARIO).join(' ou ')}).`,
    }),
  },
  { error: 'O corpo da requisição deve ser um objeto JSON com os dados do usuário.' },
)

/** Registro público. O perfil não vem no corpo: a API grava `gerente`. */
export const schemaRegistro = schemaUsuario.omit({ perfil: true })

/**
 * Alteração pelo administrador. A senha é opcional: vazia ou ausente mantém
 * a senha atual.
 */
export const schemaUsuarioAlteracao = schemaUsuario.omit({ senha: true }).extend({
  senha: z
    .string()
    .max(TAMANHO_MAXIMO_SENHA, mensagemSenha)
    .refine((valor) => valor.length === 0 || valor.length >= TAMANHO_MINIMO_SENHA, mensagemSenha)
    .optional(),
})
