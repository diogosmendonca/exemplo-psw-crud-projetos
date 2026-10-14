import { ClienteDAO } from '../ClienteDAO.js'
import { COLLATION_NOME, Cliente } from './modelos/cliente.js'

/** Documento do MongoDB → cliente no formato da API (`_id` vira `id`, em texto). */
export function paraCliente(documento) {
  return { id: String(documento._id), nome: documento.nome }
}

export class ClienteDAOMongo extends ClienteDAO {
  async listar() {
    const clientes = await Cliente.find().sort({ nome: 1 }).collation(COLLATION_NOME).lean()

    return clientes.map(paraCliente)
  }

  async obterOuCriar(nome) {
    const filtro = { nome }

    try {
      // Uma única operação (buscar ou inserir), para não criar duplicado quando
      // dois projetos com o mesmo cliente novo são salvos ao mesmo tempo.
      const cliente = await Cliente.findOneAndUpdate(
        filtro,
        { $setOnInsert: { nome } },
        { upsert: true, returnDocument: 'after', collation: COLLATION_NOME },
      ).lean()

      return paraCliente(cliente)
    } catch (erro) {
      // 11000 (chave duplicada): outra requisição criou o mesmo cliente no meio
      // do caminho. Ele já existe, então basta buscá-lo.
      if (erro.code !== 11000) throw erro

      return paraCliente(await Cliente.findOne(filtro).collation(COLLATION_NOME).lean())
    }
  }
}
