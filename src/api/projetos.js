const URL_BASE_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const URL_PROJETOS = `${URL_BASE_API}/projetos`

/**
 * `fetch` só rejeita quando não consegue falar com o servidor (API fora do ar,
 * rede caída, CORS). Aqui isso vira um erro com mensagem em português.
 */
async function conectar(url, opcoes) {
  try {
    return await fetch(url, opcoes)
  } catch {
    throw new Error(
      `Não foi possível conectar à API em ${URL_BASE_API}. Verifique se ela está em execução.`,
    )
  }
}

/** Faz a requisição e falha com `mensagemDeFalha` para respostas 4xx/5xx. */
async function requisitar(url, opcoes, mensagemDeFalha) {
  const resposta = await conectar(url, opcoes)

  if (!resposta.ok) {
    throw new Error(`${mensagemDeFalha} (${resposta.status}).`)
  }

  return resposta
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function listarProjetos() {
  const resposta = await requisitar(
    URL_PROJETOS,
    undefined,
    'Não foi possível carregar os projetos',
  )

  const dados = await resposta.json()
  return Array.isArray(dados) ? dados : dados.projetos ?? []
}

/** Busca um projeto pelo id. Devolve `null` quando ele não existe (404). */
export async function buscarProjeto(id) {
  const resposta = await conectar(`${URL_PROJETOS}/${id}`)

  if (resposta.status === 404) return null
  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar o projeto (${resposta.status}).`)
  }

  return resposta.json()
}

export async function criarProjeto(dadosProjeto) {
  const resposta = await requisitar(
    URL_PROJETOS,
    { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(dadosProjeto) },
    'Não foi possível criar o projeto',
  )

  return resposta.json()
}

export async function atualizarProjeto({ id, dadosProjeto }) {
  const resposta = await requisitar(
    `${URL_PROJETOS}/${id}`,
    { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify({ ...dadosProjeto, id }) },
    'Não foi possível alterar o projeto',
  )

  return resposta.json()
}

export async function excluirProjeto(id) {
  await requisitar(
    `${URL_PROJETOS}/${id}`,
    { method: 'DELETE' },
    'Não foi possível excluir o projeto',
  )
}
