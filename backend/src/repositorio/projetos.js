import { Projeto, idValido } from '../modelos/projeto.js'
import { obterOuCriarCliente } from './clientes.js'

/**
 * Acesso aos projetos no MongoDB (via o modelo `Projeto`).
 *
 * É a única camada que conhece o banco: as rotas só chamam estas funções. Os
 * projetos devolvidos são documentos do Mongoose que, ao virarem JSON, já saem
 * com `id` no lugar de `_id` e com o cliente como `{ id, nome }` (veja
 * `modelos/projeto.js`).
 *
 * O `id` chega como texto, vindo da URL. Um texto que não é um `ObjectId`
 * válido não existe no banco, então as funções que recebem `id` tratam esse
 * caso como "não encontrado" em vez de deixar o Mongoose lançar `CastError`.
 */

/**
 * Troca o cliente informado como `{ nome }` pela referência gravada no banco,
 * criando o cliente se for novo. Sem cliente, o campo fica `null`.
 */
async function comReferenciaDoCliente({ cliente, ...dados }) {
  if (!cliente) return { ...dados, cliente: null }

  const { _id } = await obterOuCriarCliente(cliente.nome)

  return { ...dados, cliente: _id }
}

/** Lista todos os projetos, do mais antigo para o mais novo. */
export function listarProjetos() {
  // O `_id` começa com a data de criação, então ordenar por ele é ordenar por criação.
  return Projeto.find().sort({ _id: 1 }).populate('cliente')
}

/** Busca um projeto pelo id. Devolve `null` se não existir. */
export async function buscarProjeto(id) {
  if (!idValido(id)) return null

  return Projeto.findById(id).populate('cliente')
}

/** Cria um projeto (o MongoDB gera o id) e o devolve. */
export async function criarProjeto(dados) {
  const projeto = await Projeto.create(await comReferenciaDoCliente(dados))

  return projeto.populate('cliente')
}

/** Substitui os dados de um projeto. Devolve o projeto alterado, ou `null` se não existir. */
export async function alterarProjeto(id, dados) {
  if (!idValido(id)) return null

  // `findOneAndReplace` troca o documento inteiro (semântica do PUT) e
  // devolve o novo conteúdo; `runValidators` aplica as regras do schema.
  return Projeto.findOneAndReplace({ _id: id }, await comReferenciaDoCliente(dados), {
    returnDocument: 'after',
    runValidators: true,
  }).populate('cliente')
}

/** Exclui um projeto. Devolve `true` se excluiu, `false` se ele não existia. */
export async function excluirProjeto(id) {
  if (!idValido(id)) return false

  const excluido = await Projeto.findByIdAndDelete(id)

  return excluido !== null
}
