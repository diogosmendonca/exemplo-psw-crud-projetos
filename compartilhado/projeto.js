/**
 * Regras do projeto compartilhadas entre o front-end (formulário) e o
 * back-end (API), para que as duas pontas validem do mesmo jeito.
 *
 * Este arquivo **não importa o zod**: quem usa passa o seu `z` para
 * `criarSchemasProjeto`. Assim a pasta não precisa de `node_modules` nem de
 * `package.json` próprios (o Node e o Vite não encontrariam o zod de uma pasta
 * fora do `frontend/` e do `backend/`). Os dois projetos devem usar a mesma
 * versão principal do zod.
 *
 * Quem usa:
 * - `backend/src/validacoes/projeto.js` valida o corpo das requisições com `projeto`;
 * - `frontend/src/schemas/projetoSchema.js` valida o formulário reaproveitando
 *   os `campos`, porque o formulário tem outro formato (a lista de tecnologias é
 *   um texto separado por vírgulas e o cliente é escolhido num select).
 */

export const STATUS_PROJETO = ['ativo', 'inativo']

export const TAMANHO_MAXIMO_NOME_CLIENTE = 100

/**
 * @param {import('zod').z} z O `z` do zod do projeto que está usando.
 * @returns {{ campos: object, projeto: import('zod').ZodType }}
 *   - `campos`: regras de cada campo (`nome`, `status`, `url`, `nomeCliente`),
 *     para montar schemas com outro formato;
 *   - `projeto`: o projeto como a API o recebe, já normalizado (textos sem
 *     espaços nas pontas, padrões aplicados, campos desconhecidos descartados).
 */
export function criarSchemasProjeto(z) {
  const mensagemNome = 'Informe o nome do projeto.'

  const nome = z.string({ error: mensagemNome }).trim().min(1, mensagemNome)

  const status = z.enum(STATUS_PROJETO, {
    error: `Informe o estado do projeto (${STATUS_PROJETO.join(' ou ')}).`,
  })

  // Vazia é permitida: o projeto pode ficar sem URL.
  const url = z
    .string({ error: 'A URL deve ser um texto.' })
    .trim()
    .refine((valor) => valor === '' || z.url().safeParse(valor).success, 'Informe uma URL válida.')

  // Não exige preenchimento: cada uso decide se o cliente é obrigatório.
  const nomeCliente = z
    .string({ error: 'Informe o nome do cliente.' })
    .trim()
    .max(
      TAMANHO_MAXIMO_NOME_CLIENTE,
      `O nome do cliente deve ter até ${TAMANHO_MAXIMO_NOME_CLIENTE} caracteres.`,
    )

  const mensagemTecnologias = 'As tecnologias devem ser uma lista de textos.'

  const projeto = z.object(
    {
      nome,
      status,
      // O cliente é opcional e vem como `{ nome }`. O `id` dele não é aceito: o
      // cliente é identificado pelo nome (e criado, se ainda não existir).
      cliente: z
        .object(
          { nome: nomeCliente.min(1, 'Informe o nome do cliente.') },
          { error: 'O cliente deve ser um objeto com o nome, por exemplo { "nome": "Acme" }.' },
        )
        .nullable()
        .default(null),
      descricao: z.string({ error: 'A descrição deve ser um texto.' }).default(''),
      tecnologias: z
        .array(z.string({ error: mensagemTecnologias }), { error: mensagemTecnologias })
        .default([])
        .transform((itens) => itens.map((item) => item.trim()).filter(Boolean)),
      url: url.default(''),
    },
    { error: 'O corpo da requisição deve ser um objeto JSON com os dados do projeto.' },
  )

  return { campos: { nome, status, url, nomeCliente }, projeto }
}
