import { apagarToken, comToken, guardarToken, obterToken } from './autenticacao.js'

const URL_BASE_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const URL_TOKEN = `${URL_BASE_API}/token`

async function conectar(url, opcoes) {
  try {
    return await fetch(url, comToken(opcoes))
  } catch {
    const destino = URL_BASE_API.startsWith('/') ? 'à API' : `à API em ${URL_BASE_API}`
    throw new Error(`Não foi possível conectar ${destino}. Verifique se ela está em execução.`)
  }
}

/** Usuário do JWT atual, ou `null` se não entrou ou o token não vale mais. */
export async function obterUsuario() {
  if (!obterToken()) return null

  const resposta = await conectar(URL_TOKEN)

  if (resposta.status === 401) {
    apagarToken()
    return null
  }

  if (!resposta.ok) throw new Error(`Não foi possível verificar o token (${resposta.status}).`)

  return resposta.json()
}

/** Confere a senha e guarda o JWT. A senha vai só nesta requisição. */
export async function entrar(credenciais) {
  const resposta = await conectar(URL_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciais),
  })

  if (resposta.ok) {
    const corpo = await resposta.json()
    guardarToken(corpo.token)
    return corpo.usuario
  }

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

/** Apaga o JWT do navegador. */
export function sair() {
  apagarToken()
}
