/** @typedef {import('./ProjetoDAO.js').Cliente} Cliente */

/**
 * Contrato do DAO de clientes. Cada banco tem uma classe que estende esta.
 *
 * Clientes não têm tela própria: nascem quando um projeto é salvo com um
 * cliente novo (`obterOuCriar`) e alimentam o select do formulário (`listar`).
 */
export class ClienteDAO {
  /** @returns {Promise<Cliente[]>} Os clientes em ordem alfabética. */
  async listar() {
    throw new Error('ClienteDAO.listar não foi implementado.')
  }

  /**
   * Devolve o cliente com esse nome, criando-o se ainda não existir. A busca
   * não diferencia maiúsculas de minúsculas ("acme" encontra "Acme"), e dois
   * pedidos simultâneos com o mesmo nome novo não podem criar dois clientes.
   *
   * @param {string} nome
   * @returns {Promise<Cliente>}
   */
  async obterOuCriar(nome) {
    throw new Error(`ClienteDAO.obterOuCriar(${nome}) não foi implementado.`)
  }
}
