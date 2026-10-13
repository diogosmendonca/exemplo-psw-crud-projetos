import { TAMANHO_MAXIMO_NOME } from '../modelos/cliente.js'
import { STATUS_VALIDOS } from '../modelos/projeto.js'

/**
 * Valida e normaliza o corpo recebido para criar ou alterar um projeto.
 * Devolve `{ erros }` (lista de mensagens) ou `{ projeto }` com os campos
 * já tratados. Campos desconhecidos, inclusive `id`, são descartados.
 *
 * O cliente é opcional e vem como `{ "nome": "Acme" }` (ou `null`). Um `id`
 * dentro dele é ignorado: o cliente é sempre identificado pelo nome, e é
 * criado se ainda não existir.
 */
export function validarProjeto(corpo) {
  if (corpo === null || typeof corpo !== 'object' || Array.isArray(corpo)) {
    return { erros: ['O corpo da requisição deve ser um objeto JSON com os dados do projeto.'] }
  }

  const { nome, status, cliente = null, descricao = '', tecnologias = [], url = '' } = corpo
  const erros = []

  if (typeof nome !== 'string' || nome.trim() === '') {
    erros.push('Informe o nome do projeto.')
  }

  if (!STATUS_VALIDOS.includes(status)) {
    erros.push(`O status deve ser um destes valores: ${STATUS_VALIDOS.join(', ')}.`)
  }

  const nomeDoCliente = typeof cliente?.nome === 'string' ? cliente.nome.trim() : null

  if (cliente !== null) {
    if (typeof cliente !== 'object' || Array.isArray(cliente) || typeof cliente.nome !== 'string') {
      erros.push('O cliente deve ser um objeto com o nome, por exemplo { "nome": "Acme" }.')
    } else if (nomeDoCliente === '') {
      erros.push('Informe o nome do cliente.')
    } else if (nomeDoCliente.length > TAMANHO_MAXIMO_NOME) {
      erros.push(`O nome do cliente deve ter até ${TAMANHO_MAXIMO_NOME} caracteres.`)
    }
  }

  if (typeof descricao !== 'string') {
    erros.push('A descrição deve ser um texto.')
  }

  if (!Array.isArray(tecnologias) || tecnologias.some((item) => typeof item !== 'string')) {
    erros.push('As tecnologias devem ser uma lista de textos.')
  }

  if (typeof url !== 'string') {
    erros.push('A URL deve ser um texto.')
  } else if (url.trim() !== '' && !URL.canParse(url.trim())) {
    erros.push('Informe uma URL válida.')
  }

  if (erros.length > 0) return { erros }

  return {
    projeto: {
      nome: nome.trim(),
      status,
      cliente: nomeDoCliente === null ? null : { nome: nomeDoCliente },
      descricao,
      tecnologias: tecnologias.map((item) => item.trim()).filter(Boolean),
      url: url.trim(),
    },
  }
}
