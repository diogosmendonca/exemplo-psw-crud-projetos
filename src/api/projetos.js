const URL_PROJETOS = 'http://localhost:3000/projetos'

async function verificarResposta(resposta, mensagem) {
  if (!resposta.ok) {
    throw new Error(`${mensagem} (${resposta.status}).`)
  }
}

export async function listarProjetos() {
  const resposta = await fetch(URL_PROJETOS)
  await verificarResposta(resposta, 'Não foi possível carregar os projetos')

  const dados = await resposta.json()
  return Array.isArray(dados) ? dados : dados.projetos ?? []
}

export async function criarProjeto(dadosProjeto) {
  const resposta = await fetch(URL_PROJETOS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosProjeto),
  })
  await verificarResposta(resposta, 'Não foi possível criar o projeto')

  return resposta.json()
}

export async function atualizarProjeto({ id, dadosProjeto }) {
  const resposta = await fetch(`${URL_PROJETOS}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...dadosProjeto, id }),
  })
  await verificarResposta(resposta, 'Não foi possível alterar o projeto')

  return resposta.json()
}

export async function excluirProjeto(id) {
  const resposta = await fetch(`${URL_PROJETOS}/${id}`, {
    method: 'DELETE',
  })
  await verificarResposta(resposta, 'Não foi possível excluir o projeto')
}
