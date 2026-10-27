/**
 * Sessão encerrada (ou inexistente). Sai da tela atual e abre a de entrada.
 * Não faz nada se já estiver nela, para não recarregar em loop.
 */
export function pedirAutenticacao(resposta) {
  if (resposta.status !== 401) return false
  if (window.location.pathname === '/entrar') return false

  window.location.assign('/entrar')
  return true
}
