import { ambiente } from '../../config/ambiente.js'
import { enderecoSemSenha } from '../enderecoSemSenha.js'
import { ClienteDAOPostgres } from './ClienteDAOPostgres.js'
import { conectarPostgres, desconectarPostgres, prisma } from './conexao.js'
import { ProjetoDAOPostgres } from './ProjetoDAOPostgres.js'

/** @returns {import('../index.js').FonteDeDados} */
export function criarFonteDeDados() {
  const clientes = new ClienteDAOPostgres(prisma)

  return {
    nome: 'PostgreSQL',
    endereco: enderecoSemSenha(ambiente.postgresUrl),
    conectar: conectarPostgres,
    desconectar: desconectarPostgres,
    versao: async () => (await prisma.$queryRaw`SHOW server_version`)[0].server_version,
    projetos: new ProjetoDAOPostgres(prisma, clientes),
    clientes,
  }
}
