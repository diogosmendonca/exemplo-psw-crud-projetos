import { ambiente } from '../config/ambiente.js'

/**
 * @typedef {object} FonteDeDados
 * @property {string} nome Nome do banco, para mensagens (ex.: "MongoDB").
 * @property {string} endereco Endereço do banco sem a senha, seguro para logs.
 * @property {() => Promise<void>} conectar Falha com mensagem clara se o banco não responder.
 * @property {() => Promise<void>} desconectar
 * @property {() => Promise<string>} versao Versão do servidor do banco.
 * @property {import('./ProjetoDAO.js').ProjetoDAO} projetos
 * @property {import('./ClienteDAO.js').ClienteDAO} clientes
 * @property {import('./UsuarioDAO.js').UsuarioDAO} usuarios
 */

// Cada banco fica em um módulo carregado só quando escolhido: rodar com MongoDB
// não carrega o Prisma, e vice-versa.
const BANCOS = {
  mongodb: () => import('./mongo/index.js'),
  postgres: () => import('./postgres/index.js'),
}

/**
 * Fábrica dos DAOs: devolve a implementação do banco escolhido em `BANCO`
 * (no `.env`). É o único lugar da aplicação que sabe quais bancos existem.
 *
 * @param {string} [banco]
 * @returns {Promise<FonteDeDados>}
 */
export async function criarFonteDeDados(banco = ambiente.banco) {
  const carregar = BANCOS[banco]

  if (!carregar) {
    throw new Error(
      `BANCO inválido: "${banco}". Use um destes valores: ${Object.keys(BANCOS).join(', ')}.`,
    )
  }

  const { criarFonteDeDados: criar } = await carregar()

  return criar()
}
