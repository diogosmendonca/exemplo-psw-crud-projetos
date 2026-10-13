import mongoose from 'mongoose'
import { STATUS_PROJETO } from '../../../compartilhado/projeto.js'
import { paraApi } from './paraApi.js'

/**
 * Schema e modelo do projeto no MongoDB.
 *
 * ## O campo `id` da API e o `_id` do MongoDB
 *
 * A API e o front-end falam em `id` (texto); o MongoDB guarda `_id`
 * (`ObjectId`). A conversão acontece nas duas pontas, aqui, para o resto da
 * aplicação nunca ver `_id` nem `__v`:
 *
 * - **Banco → API:** `toJSON`/`toObject` devolvem `id` (texto de 24 caracteres
 *   hexadecimais) no lugar de `_id`, e omitem `__v`. Por isso `resposta.json(doc)`
 *   já produz o formato que o front-end espera.
 * - **API → banco:** `Projeto.paraDocumento()` troca `id` por `_id`, para quando
 *   um objeto vindo da API (ou do arquivo JSON antigo) for gravado. Para consultas
 *   por id, `Projeto.findById(id)` aceita o texto direto, mas só depois de
 *   `idValido(id)`: um texto fora do formato faria o Mongoose lançar `CastError`,
 *   quando o correto para a API é responder 404.
 *
 * Os ids antigos do arquivo JSON (1, 2, 3...) não são `ObjectId` válidos, então
 * não podem ser reaproveitados como `_id`.
 */

const FORMATO_ID = /^[0-9a-f]{24}$/i

/** Diz se o texto é um id possível (24 caracteres hexadecimais). */
export function idValido(id) {
  return typeof id === 'string' && FORMATO_ID.test(id)
}

const schemaProjeto = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Informe o nome do projeto.'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Informe o status do projeto.'],
      enum: {
        values: STATUS_PROJETO,
        message: `O status deve ser um destes valores: ${STATUS_PROJETO.join(', ')}.`,
      },
    },
    // Referência ao cliente (`_id` na coleção `cliente`). Opcional: projetos
    // antigos não têm cliente. As consultas usam `populate('cliente')`, então a
    // API devolve `{ id, nome }` (ou `null`) em vez do `_id` solto.
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
    descricao: { type: String, default: '' },
    tecnologias: { type: [String], default: [] },
    url: {
      type: String,
      default: '',
      trim: true,
      validate: {
        validator: (url) => url === '' || URL.canParse(url),
        message: 'Informe uma URL válida.',
      },
    },
  },
  {
    collection: 'projetos',
    // Sem `__v`: o controle de versão do Mongoose não faz parte da API.
    versionKey: false,
  },
)

schemaProjeto.set('toJSON', { transform: paraApi })
schemaProjeto.set('toObject', { transform: paraApi })

/**
 * API → banco: troca `id` por `_id`. Sem `id`, devolve os dados como estão
 * (o MongoDB gera o `_id` ao inserir). Lança erro se o `id` for inválido.
 */
schemaProjeto.static('paraDocumento', function paraDocumento(dados) {
  const { id, ...campos } = dados

  if (id === undefined) return campos

  if (!idValido(String(id))) {
    throw new TypeError(`Id de projeto inválido: ${id}`)
  }

  return { _id: String(id), ...campos }
})

export const Projeto = mongoose.model('Projeto', schemaProjeto)
