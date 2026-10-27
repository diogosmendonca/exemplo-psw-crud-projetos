/**
 * @typedef {object} Usuario
 * @property {string} id
 * @property {string} nome
 * @property {string} email
 * @property {string} nomeUsuario
 * @property {'administrador'|'gerente'} perfil
 */

/**
 * Dados já validados para gravar um usuário. A senha chega só como hash:
 * o texto puro não passa do Passport.
 *
 * @typedef {Omit<Usuario, 'id'> & { senhaHash: string }} DadosUsuario
 */

/** E-mail ou nome de usuário já cadastrado. A rota responde 409. */
export class UsuarioJaCadastrado extends Error {
  /**
   * @param {'email'|'nomeUsuario'} campo
   */
  constructor(campo) {
    super(
      campo === 'email'
        ? 'Já existe um usuário com este e-mail.'
        : 'Já existe um usuário com este nome de usuário.',
    )
    this.name = 'UsuarioJaCadastrado'
    this.campo = campo
  }
}

/**
 * Contrato do DAO de usuários. Cada banco tem uma classe que estende esta.
 *
 * A resposta da API nunca inclui a senha. `buscarParaAutenticacao` é a exceção:
 * só a estratégia local do Passport a usa, para conferir o hash no login.
 */
export class UsuarioDAO {
  /**
   * @param {DadosUsuario} dados
   * @returns {Promise<Usuario>}
   * @throws {UsuarioJaCadastrado} E-mail ou nome de usuário já existe,
   *   inclusive com diferença só de maiúsculas.
   */
  async criar(dados) {
    throw new Error(`UsuarioDAO.criar(${dados?.nomeUsuario}) não foi implementado.`)
  }

  /**
   * Busca pelo nome de usuário, sem diferenciar maiúsculas.
   *
   * @param {string} nomeUsuario
   * @returns {Promise<(Usuario & { senhaHash: string })|null>}
   */
  async buscarParaAutenticacao(nomeUsuario) {
    throw new Error(`UsuarioDAO.buscarParaAutenticacao(${nomeUsuario}) não foi implementado.`)
  }

  /**
   * Usado pela estratégia JWT: o token guarda só o id (`sub`).
   *
   * @param {string} id
   * @returns {Promise<Usuario|null>}
   */
  async buscarPorId(id) {
    throw new Error(`UsuarioDAO.buscarPorId(${id}) não foi implementado.`)
  }
}
