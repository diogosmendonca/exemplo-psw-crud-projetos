import { z } from 'zod'
import { criarSchemasProjeto } from '../../../compartilhado/projeto.js'

// As regras de cada campo (nome, estado, URL e nome do cliente) são as mesmas
// que o back-end aplica, e ficam em `compartilhado/projeto.js`. O formulário só
// muda o formato: as tecnologias são um texto separado por vírgulas e o cliente
// vem de um select.
const { campos } = criarSchemasProjeto(z)

/** Valor da opção "Novo cliente…" do select de cliente (não é um nome de cliente). */
export const NOVO_CLIENTE = '__novo__'

const schemaProjeto = z
  .object({
    nome: campos.nome,
    status: campos.status,
    // Opcional. '' (sem cliente), o nome de um cliente existente ou `NOVO_CLIENTE`.
    cliente: z.string(),
    // Só vale quando `cliente` é `NOVO_CLIENTE`: o nome do cliente a cadastrar.
    novoCliente: campos.nomeCliente,
    descricao: z.string(),
    tecnologias: z.string(),
    url: campos.url,
  })
  .superRefine((dados, contexto) => {
    if (dados.cliente === NOVO_CLIENTE && dados.novoCliente === '') {
      contexto.addIssue({
        code: 'custom',
        path: ['novoCliente'],
        message: 'Informe o nome do novo cliente.',
      })
    }
  })

export default schemaProjeto
