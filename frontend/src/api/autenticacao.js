const CHAVE_TOKEN = 'token'

/** JWT guardado no navegador, ou `null` se a pessoa não entrou. */
export function obterToken() {
  return localStorage.getItem(CHAVE_TOKEN)
}

/** Guarda o JWT devolvido pelo login. As próximas requisições o enviam. */
export function guardarToken(token) {
  localStorage.setItem(CHAVE_TOKEN, token)
}

/** Sair: apaga o token. O servidor não guarda sessão para encerrar. */
export function apagarToken() {
  localStorage.removeItem(CHAVE_TOKEN)
}

/**
 * Acrescenta `Authorization: Bearer` quando há token. O JWT vai em toda
 * requisição; a senha só vai no login.
 */
export function comToken(opcoes = {}) {
  const token = obterToken()

  return {
    ...opcoes,
    headers: {
      ...opcoes.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
}

/**
 * Token ausente, inválido ou vencido. Apaga o que estava guardado e abre a
 * tela de entrada. Não recarrega se já estiver nela.
 */
export function pedirAutenticacao(resposta) {
  if (resposta.status !== 401) return false

  apagarToken()
  if (window.location.pathname === '/entrar') return false

  window.location.assign('/entrar')
  return true
}
