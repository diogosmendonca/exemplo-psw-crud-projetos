/**
 * @typedef {object} Cliente
 * @property {string} id
 * @property {string} nome
 */

/**
 * Projeto no formato da API, igual para qualquer banco.
 *
 * @typedef {object} Projeto
 * @property {string} id Gerado pelo banco. É sempre texto, mesmo no PostgreSQL
 *   (onde é um número sequencial), para a API não depender do banco escolhido.
 * @property {string} nome
 * @property {'ativo'|'inativo'} status
 * @property {Cliente|null} cliente
 * @property {string} descricao
 * @property {string[]} tecnologias
 * @property {string} url
 */

/**
 * Dados para criar ou alterar um projeto, já validados por `validarProjeto`.
 * O cliente vem só com o nome: o DAO o cria se ainda não existir.
 *
 * @typedef {Omit<Projeto, 'id' | 'cliente'> & { cliente: { nome: string } | null }} DadosProjeto
 */

/**
 * Contrato do DAO de projetos. Cada banco tem uma classe que estende esta e
 * implementa todos os métodos; as rotas só conhecem este contrato.
 *
 * Um `id` em formato que o banco não usa (ex.: "abc") é tratado como projeto
 * inexistente: `buscarPorId` e `alterar` devolvem `null` e `excluir`, `false`.
 */
export class ProjetoDAO {
  /** @returns {Promise<Projeto[]>} Todos os projetos, do mais antigo para o mais novo. */
  async listar() {
    throw new Error('ProjetoDAO.listar não foi implementado.')
  }

  /**
   * @param {string} id
   * @returns {Promise<Projeto|null>}
   */
  async buscarPorId(id) {
    throw new Error(`ProjetoDAO.buscarPorId(${id}) não foi implementado.`)
  }

  /**
   * @param {DadosProjeto} dados
   * @returns {Promise<Projeto>} O projeto criado, com o id gerado pelo banco.
   */
  async criar(dados) {
    throw new Error(`ProjetoDAO.criar(${dados?.nome}) não foi implementado.`)
  }

  /**
   * Substitui todos os dados do projeto (semântica do PUT).
   *
   * @param {string} id
   * @param {DadosProjeto} dados
   * @returns {Promise<Projeto|null>} O projeto alterado, ou `null` se não existir.
   */
  async alterar(id, dados) {
    throw new Error(`ProjetoDAO.alterar(${id}, ${dados?.nome}) não foi implementado.`)
  }

  /**
   * @param {string} id
   * @returns {Promise<boolean>} `true` se excluiu, `false` se o projeto não existia.
   */
  async excluir(id) {
    throw new Error(`ProjetoDAO.excluir(${id}) não foi implementado.`)
  }
}
