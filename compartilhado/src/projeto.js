import { z } from 'zod'

/**
 * Regras do projeto, as mesmas no front-end (formulário) e no back-end (API).
 *
 * - `schemaProjeto`: o projeto como a API o recebe. Valida e normaliza (textos
 *   sem espaços nas pontas, padrões aplicados, campos desconhecidos descartados).
 *   O back-end o usa direto; o front-end o estende para o formato do formulário.
 * - `schemaNomeCliente`: o nome de um cliente (pode ser vazio; cada uso decide
 *   se ele é obrigatório).
 */

export const STATUS_PROJETO = ['ativo', 'inativo']

export const TAMANHO_MAXIMO_NOME_CLIENTE = 100

const mensagemNome = 'Informe o nome do projeto.'
const mensagemTecnologias = 'As tecnologias devem ser uma lista de textos.'

export const schemaNomeCliente = z
  .string({ error: 'Informe o nome do cliente.' })
  .trim()
  .max(
    TAMANHO_MAXIMO_NOME_CLIENTE,
    `O nome do cliente deve ter até ${TAMANHO_MAXIMO_NOME_CLIENTE} caracteres.`,
  )

export const schemaProjeto = z.object(
  {
    nome: z.string({ error: mensagemNome }).trim().min(1, mensagemNome),
    status: z.enum(STATUS_PROJETO, {
      error: `Informe o estado do projeto (${STATUS_PROJETO.join(' ou ')}).`,
    }),
    // O cliente é opcional e vem como `{ nome }`. O `id` dele não é aceito: o
    // cliente é identificado pelo nome (e criado, se ainda não existir).
    cliente: z
      .object(
        { nome: schemaNomeCliente.min(1, 'Informe o nome do cliente.') },
        { error: 'O cliente deve ser um objeto com o nome, por exemplo { "nome": "Acme" }.' },
      )
      .nullable()
      .default(null),
    descricao: z.string({ error: 'A descrição deve ser um texto.' }).default(''),
    tecnologias: z
      .array(z.string({ error: mensagemTecnologias }), { error: mensagemTecnologias })
      .default([])
      .transform((itens) => itens.map((item) => item.trim()).filter(Boolean)),
    // Vazia é permitida: o projeto pode ficar sem URL.
    url: z
      .string({ error: 'A URL deve ser um texto.' })
      .trim()
      .refine((valor) => valor === '' || z.url().safeParse(valor).success, 'Informe uma URL válida.')
      .default(''),
  },
  { error: 'O corpo da requisição deve ser um objeto JSON com os dados do projeto.' },
)
