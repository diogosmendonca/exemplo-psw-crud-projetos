import { comToken, pedirAutenticacao } from './autenticacao.js'

const URL_BASE_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const URL_USUARIOS = `${URL_BASE_API}/usuarios`
const URL_REGISTRO = `${URL_BASE_API}/registro`

async function conectar(url, opcoes) {
  try {
    return await fetch(url, comToken(opcoes))
  } catch {
    const destino = URL_BASE_API.startsWith('/') ? 'à API' : `à API em ${URL_BASE_API}`
    throw new Error(`Não foi possível conectar ${destino}. Verifique se ela está em execução.`)
  }
}

async function lerCorpo(resposta) {
  try {
    return await resposta.json()
  } catch {
    return {}
  }
}

function erroDaApi(corpo, status, fallback) {
  const mensagem = Array.isArray(corpo.erros) && corpo.erros.length
    ? corpo.erros.join(' ')
    : corpo.mensagem ?? `${fallback} (${status}).`

  const erro = new Error(mensagem)
  erro.campo = corpo.campo
  return erro
}

export async function listarUsuarios() {
  const resposta = await conectar(URL_USUARIOS)

  if (pedirAutenticacao(resposta)) return new Promise(() => {})
  if (!resposta.ok) {
    throw erroDaApi(await lerCorpo(resposta), resposta.status, 'Não foi possível carregar os usuários')
  }

  const dados = await resposta.json()
  return Array.isArray(dados) ? dados : []
}

/** Devolve `null` quando o usuário não existe (404). */
export async function buscarUsuario(id) {
  const resposta = await conectar(`${URL_USUARIOS}/${id}`)

  if (resposta.status === 404) return null
  if (pedirAutenticacao(resposta)) return new Promise(() => {})
  if (!resposta.ok) throw erroDaApi(await lerCorpo(resposta), resposta.status, 'Não foi possível carregar o usuário')

  return resposta.json()
}

/**
 * Cadastra um usuário. A resposta não traz a senha.
 * Quando o e-mail ou o nome de usuário já existe, `campo` indica qual dos dois.
 */
export async function cadastrarUsuario(dados) {
  const resposta = await conectar(URL_USUARIOS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })

  if (pedirAutenticacao(resposta)) return new Promise(() => {})
  if (resposta.ok) return resposta.json()

  throw erroDaApi(await lerCorpo(resposta), resposta.status, 'Não foi possível cadastrar o usuário')
}

export async function atualizarUsuario({ id, dados }) {
  const resposta = await conectar(`${URL_USUARIOS}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })

  if (pedirAutenticacao(resposta)) return new Promise(() => {})
  if (resposta.ok) return resposta.json()

  throw erroDaApi(await lerCorpo(resposta), resposta.status, 'Não foi possível alterar o usuário')
}

export async function excluirUsuario(id) {
  const resposta = await conectar(`${URL_USUARIOS}/${id}`, { method: 'DELETE' })

  if (pedirAutenticacao(resposta)) return new Promise(() => {})
  if (resposta.ok || resposta.status === 204) return

  throw erroDaApi(await lerCorpo(resposta), resposta.status, 'Não foi possível excluir o usuário')
}

/** Registro público. Não envia token e a API grava o perfil gerente. */
export async function registrarGerente(dados) {
  let resposta

  try {
    resposta = await fetch(URL_REGISTRO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    })
  } catch {
    const destino = URL_BASE_API.startsWith('/') ? 'à API' : `à API em ${URL_BASE_API}`
    throw new Error(`Não foi possível conectar ${destino}. Verifique se ela está em execução.`)
  }

  if (resposta.ok) return resposta.json()

  throw erroDaApi(await lerCorpo(resposta), resposta.status, 'Não foi possível registrar o usuário')
}
