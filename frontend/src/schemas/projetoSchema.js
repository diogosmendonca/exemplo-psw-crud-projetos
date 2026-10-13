import { z } from 'zod'

/** Valor da opção "Novo cliente…" do select de cliente (não é um nome de cliente). */
export const NOVO_CLIENTE = '__novo__'

const TAMANHO_MAXIMO_CLIENTE = 100

const schemaProjeto = z.object({
  nome: z.string().trim().min(1, 'Informe o nome do projeto.'),
  status: z.enum(['ativo', 'inativo'], {
    error: 'Selecione o estado do projeto.',
  }),
  // Opcional. '' (sem cliente), o nome de um cliente existente ou `NOVO_CLIENTE`.
  cliente: z.string(),
  // Só vale quando `cliente` é `NOVO_CLIENTE`: o nome do cliente a cadastrar.
  novoCliente: z
    .string()
    .trim()
    .max(TAMANHO_MAXIMO_CLIENTE, `O nome do cliente deve ter até ${TAMANHO_MAXIMO_CLIENTE} caracteres.`),
  descricao: z.string(),
  tecnologias: z.string(),
  url: z.string().trim().refine(
    (valor) => valor === '' || z.url().safeParse(valor).success,
    'Informe uma URL válida.',
  ),
}).superRefine((dados, contexto) => {
  if (dados.cliente === NOVO_CLIENTE && dados.novoCliente === '') {
    contexto.addIssue({
      code: 'custom',
      path: ['novoCliente'],
      message: 'Informe o nome do novo cliente.',
    })
  }
})

export default schemaProjeto
