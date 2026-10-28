/**
 * Depois do JWT. O perfil vem do usuário recarregado a cada requisição.
 * Um gerente autenticado recebe 403: estar dentro não basta para gerenciar usuários.
 */
export function exigirAdministrador(requisicao, resposta, proximo) {
  if (requisicao.method === 'OPTIONS') return proximo()
  if (requisicao.user?.perfil === 'administrador') return proximo()

  resposta.status(403).json({ mensagem: 'Somente um administrador pode gerenciar usuários.' })
}
