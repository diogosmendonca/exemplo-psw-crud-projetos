const STATUS_VALIDOS = ['ativo', 'inativo']

/**
 * Valida e normaliza o corpo recebido para criar ou alterar um projeto.
 * Devolve `{ erros }` (lista de mensagens) ou `{ projeto }` com os campos
 * já tratados. Campos desconhecidos, inclusive `id`, são descartados.
 */
export function validarProjeto(corpo) {
  if (corpo === null || typeof corpo !== 'object' || Array.isArray(corpo)) {
    return { erros: ['O corpo da requisição deve ser um objeto JSON com os dados do projeto.'] }
  }

  const { nome, status, descricao = '', tecnologias = [], url = '' } = corpo
  const erros = []

  if (typeof nome !== 'string' || nome.trim() === '') {
    erros.push('Informe o nome do projeto.')
  }

  if (!STATUS_VALIDOS.includes(status)) {
    erros.push(`O status deve ser um destes valores: ${STATUS_VALIDOS.join(', ')}.`)
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
      descricao,
      tecnologias: tecnologias.map((item) => item.trim()).filter(Boolean),
      url: url.trim(),
    },
  }
}
