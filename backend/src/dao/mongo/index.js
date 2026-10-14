import mongoose from 'mongoose'
import { ambiente } from '../../config/ambiente.js'
import { enderecoSemSenha } from '../enderecoSemSenha.js'
import { ClienteDAOMongo } from './ClienteDAOMongo.js'
import { conectarMongo, desconectarMongo } from './conexao.js'
import { ProjetoDAOMongo } from './ProjetoDAOMongo.js'

/** @returns {import('../index.js').FonteDeDados} */
export function criarFonteDeDados() {
  const clientes = new ClienteDAOMongo()

  return {
    nome: 'MongoDB',
    endereco: enderecoSemSenha(ambiente.mongoUri),
    conectar: conectarMongo,
    desconectar: desconectarMongo,
    versao: async () => (await mongoose.connection.db.admin().serverInfo()).version,
    projetos: new ProjetoDAOMongo(clientes),
    clientes,
  }
}
