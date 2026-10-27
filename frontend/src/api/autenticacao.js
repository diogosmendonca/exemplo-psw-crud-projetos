/**
 * O prompt de Basic Auth só aparece quando o próprio navegador pede a página.
 * Um `fetch` que recebe 401 não abre esse prompt, então a aplicação navega
 * para `/autenticar` (protegida pelo Passport) e o navegador pede usuário e senha.
 */
export function pedirAutenticacao(resposta) {
  if (resposta.status !== 401) return false

  window.location.assign('/autenticar')
  return true
}
