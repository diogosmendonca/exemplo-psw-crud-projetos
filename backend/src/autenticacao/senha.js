import bcrypt from 'bcrypt'

// Custo do bcrypt. Cada ponto a mais dobra o tempo de cálculo: 10 é o patamar
// usual e já deixa um ataque de força bruta lento, sem atrasar o cadastro.
const CUSTO = 10

/**
 * Gera o hash da senha com salt aleatório. O texto puro não é gravado; o hash
 * é o que uma futura estratégia de login do Passport confere com `bcrypt.compare`.
 *
 * @param {string} senha
 * @returns {Promise<string>}
 */
export function gerarHashDaSenha(senha) {
  return bcrypt.hash(senha, CUSTO)
}

/**
 * Confere a senha digitada com o hash gravado. O bcrypt lê o salt que está
 * dentro do próprio hash.
 *
 * @param {string} senha
 * @param {string} senhaHash
 * @returns {Promise<boolean>}
 */
export function conferirSenha(senha, senhaHash) {
  return bcrypt.compare(senha, senhaHash)
}
