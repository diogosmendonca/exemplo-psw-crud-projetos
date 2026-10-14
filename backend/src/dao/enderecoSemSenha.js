/** Endereço de conexão sem usuário e senha, seguro para aparecer em logs. */
export function enderecoSemSenha(endereco) {
  return endereco.replace(/\/\/[^@/]*@/, '//***@')
}
