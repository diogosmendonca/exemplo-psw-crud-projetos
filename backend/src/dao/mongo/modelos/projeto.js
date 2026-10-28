import mongoose from 'mongoose'
import { STATUS_PROJETO } from '@gerenciador-de-projetos/compartilhado'

/**
 * Schema e modelo do projeto no MongoDB, na coleção `projetos`. Quem usa é
 * o `ProjetoDAOMongo`, que converte os documentos para o formato da API.
 */

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
    // antigos não têm cliente.
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
    // Gerente de projetos dono deste projeto. Projetos antigos ficam sem gerente
    // até um administrador associar alguém; só o administrador os vê.
    gerente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null, index: true },
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

export const Projeto = mongoose.model('Projeto', schemaProjeto)
