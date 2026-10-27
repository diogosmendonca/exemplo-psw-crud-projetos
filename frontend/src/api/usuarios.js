import { pedirAutenticacao } from './autenticacao.js'

const URL_BASE_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const URL_USUARIOS = `${URL_BASE_API}/usuarios`

/**
 * `fetch` só rejeita quando não consegue falar com o servidor (API fora do ar,
 * rede caída, CORS). Aqui isso vira um erro com mensagem em português.
 */
async function conectar(url, opcoes) {
  try {
    return await fetch(url, opcoes)
  } catch {
    const destino = URL_BASE_API.startsWith('/') ? 'à API' : `à API em ${URL_BASE_API}`
    throw new Error(`Não foi possível conectar ${destino}. Verifique se ela está em execução.`)
  }
}

/**
 * Cadastra um usuário. A resposta não traz a senha.
 * Em caso de falha, o erro tem a mensagem da API e, quando o e-mail ou o nome
 * de usuário já existe, `campo` indica qual dos dois.
 */
export async function cadastrarUsuario(dados) {
  const resposta = await conectar(URL_USUARIOS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })

  if (pedirAutenticacao(resposta)) return new Promise(() => {})
  if (resposta.ok) return resposta.json()

  let corpo = {}
  try {
    corpo = await resposta.json()
  } catch {
    corpo = {}
  }

  const mensagem = Array.isArray(corpo.erros) && corpo.erros.length
    ? corpo.erros.join(' ')
    : corpo.mensagem ?? `Não foi possível cadastrar o usuário (${resposta.status}).`

  const erro = new Error(mensagem)
  erro.campo = corpo.campo
  throw erro
}
