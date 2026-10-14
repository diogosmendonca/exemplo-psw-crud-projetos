import { ProjetoDAO } from '../ProjetoDAO.js'
import { paraCliente } from './ClienteDAOMongo.js'
import { Projeto } from './modelos/projeto.js'

// O `_id` do MongoDB é um ObjectId: 24 caracteres hexadecimais. Um texto fora
// desse formato faria o Mongoose lançar `CastError`; aqui ele é tratado como
// projeto inexistente (a API responde 404).
const FORMATO_ID = /^[0-9a-f]{24}$/i

function idValido(id) {
  return typeof id === 'string' && FORMATO_ID.test(id)
}

/** Documento do MongoDB (com o cliente populado) → projeto no formato da API. */
function paraProjeto(documento) {
  return {
    id: String(documento._id),
    nome: documento.nome,
    status: documento.status,
    cliente: documento.cliente ? paraCliente(documento.cliente) : null,
    descricao: documento.descricao,
    tecnologias: [...documento.tecnologias],
    url: documento.url,
  }
}

export class ProjetoDAOMongo extends ProjetoDAO {
  /** @param {import('../ClienteDAO.js').ClienteDAO} clientes */
  constructor(clientes) {
    super()
    this.clientes = clientes
  }

  /** Troca `cliente: { nome }` pelo `_id` do cliente, criando-o se for novo. */
  async #paraDocumento({ cliente, ...dados }) {
    if (!cliente) return { ...dados, cliente: null }

    const { id } = await this.clientes.obterOuCriar(cliente.nome)

    return { ...dados, cliente: id }
  }

  async listar() {
    // O `_id` começa com a data de criação, então ordenar por ele é ordenar por criação.
    const projetos = await Projeto.find().sort({ _id: 1 }).populate('cliente').lean()

    return projetos.map(paraProjeto)
  }

  async buscarPorId(id) {
    if (!idValido(id)) return null

    const projeto = await Projeto.findById(id).populate('cliente').lean()

    return projeto ? paraProjeto(projeto) : null
  }

  async criar(dados) {
    const projeto = await Projeto.create(await this.#paraDocumento(dados))

    return paraProjeto(await projeto.populate('cliente'))
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
      .lean()

    return projeto ? paraProjeto(projeto) : null
  }

  async excluir(id) {
    if (!idValido(id)) return false

    return (await Projeto.findByIdAndDelete(id)) !== null
  }
}
