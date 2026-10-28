import { ProjetoDAO } from '../ProjetoDAO.js'
import { paraCliente } from './ClienteDAOMongo.js'
import { Projeto } from './modelos/projeto.js'
// Garante o model `Usuario` antes do `populate('gerente')`.
import './modelos/usuario.js'

// O `_id` do MongoDB é um ObjectId: 24 caracteres hexadecimais. Um texto fora
// desse formato faria o Mongoose lançar `CastError`; aqui ele é tratado como
// projeto inexistente (a API responde 404).
const FORMATO_ID = /^[0-9a-f]{24}$/i

function idValido(id) {
  return typeof id === 'string' && FORMATO_ID.test(id)
}

function paraGerente(gerente) {
  if (!gerente?._id) return null

  return { id: String(gerente._id), nome: gerente.nome }
}

/** Documento do MongoDB (com cliente e gerente populados) → projeto no formato da API. */
function paraProjeto(documento) {
  return {
    id: String(documento._id),
    nome: documento.nome,
    status: documento.status,
    cliente: documento.cliente ? paraCliente(documento.cliente) : null,
    descricao: documento.descricao,
    tecnologias: [...documento.tecnologias],
    url: documento.url,
    gerente: paraGerente(documento.gerente),
  }
}

export class ProjetoDAOMongo extends ProjetoDAO {
  /** @param {import('../ClienteDAO.js').ClienteDAO} clientes */
  constructor(clientes) {
    super()
    this.clientes = clientes
  }

  /** Troca `cliente: { nome }` e `gerenteId` pelos `_id` gravados no documento. */
  async #paraDocumento({ cliente, gerenteId, ...dados }) {
    const documento = { ...dados, gerente: gerenteId || null }

    if (!cliente) return { ...documento, cliente: null }

    const { id } = await this.clientes.obterOuCriar(cliente.nome)

    return { ...documento, cliente: id }
  }

  async #buscar(filtro) {
    return Projeto.find(filtro).sort({ _id: 1 }).populate('cliente').populate('gerente').lean()
  }

  async listar(gerenteId) {
    if (gerenteId && !idValido(gerenteId)) return []

    // O `_id` começa com a data de criação, então ordenar por ele é ordenar por criação.
    const projetos = await this.#buscar(gerenteId ? { gerente: gerenteId } : {})

    return projetos.map(paraProjeto)
  }

  async buscarPorId(id) {
    if (!idValido(id)) return null

    const projeto = await Projeto.findById(id).populate('cliente').populate('gerente').lean()

    return projeto ? paraProjeto(projeto) : null
  }

  async criar(dados) {
    const projeto = await Projeto.create(await this.#paraDocumento(dados))

    return paraProjeto(await projeto.populate(['cliente', 'gerente']))
  }

  async alterar(id, dados) {
    if (!idValido(id)) return null

    // `findOneAndReplace` troca o documento inteiro (semântica do PUT) e
    // devolve o novo conteúdo; `runValidators` aplica as regras do schema.
    const projeto = await Projeto.findOneAndReplace({ _id: id }, await this.#paraDocumento(dados), {
      returnDocument: 'after',
      runValidators: true,
    })
      .populate('cliente')
      .populate('gerente')
      .lean()

    return projeto ? paraProjeto(projeto) : null
  }

  async excluir(id) {
    if (!idValido(id)) return false

    return (await Projeto.findByIdAndDelete(id)) !== null
  }

  async existeDoGerente(gerenteId) {
    if (!idValido(gerenteId)) return false

    return (await Projeto.exists({ gerente: gerenteId })) !== null
  }
}
