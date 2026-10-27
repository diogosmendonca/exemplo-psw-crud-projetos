import { pedirAutenticacao } from './autenticacao.js'

const URL_BASE_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const URL_SESSAO = `${URL_BASE_API}/sessao`

async function conectar(url, opcoes) {
  try {
    return await fetch(url, { credentials: 'include', ...opcoes })
  } catch {
    const destino = URL_BASE_API.startsWith('/') ? 'à API' : `à API em ${URL_BASE_API}`
    throw new Error(`Não foi possível conectar ${destino}. Verifique se ela está em execução.`)
  }
}

/** Usuário da sessão atual, ou `null` se não entrou. */
export async function obterSessao() {
  const resposta = await conectar(URL_SESSAO)

  if (resposta.status === 401) return null
  if (!resposta.ok) throw new Error(`Não foi possível verificar a sessão (${resposta.status}).`)

  return resposta.json()
}

/** Abre a sessão. A senha vai só nesta requisição; depois o navegador manda o cookie. */
export async function entrar(credenciais) {
  const resposta = await conectar(URL_SESSAO, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciais),
  })

  if (resposta.ok) return resposta.json()

  let corpo = {}
  try {
    corpo = await resposta.json()
  } catch {
    corpo = {}
  }

  const mensagem = Array.isArray(corpo.erros) && corpo.erros.length
    ? corpo.erros.join(' ')
    : corpo.mensagem ?? `Não foi possível entrar (${resposta.status}).`

  throw new Error(mensagem)
}

/** Encerra a sessão e apaga o cookie. */
export async function sair() {
  const resposta = await conectar(URL_SESSAO, { method: 'DELETE' })

  if (pedirAutenticacao(resposta)) return new Promise(() => {})
  if (!resposta.ok && resposta.status !== 204) {
    throw new Error(`Não foi possível sair (${resposta.status}).`)
  }
}
