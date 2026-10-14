import mongoose from 'mongoose'
import { TAMANHO_MAXIMO_NOME_CLIENTE } from '@gerenciador-de-projetos/compartilhado'

/**
 * Schema e modelo do cliente, na coleção `cliente`.
 *
 * Um cliente pode ter muitos projetos, e cada projeto tem (no máximo) um
 * cliente: a ligação fica no projeto (`Projeto.cliente`, uma referência ao
 * `_id` do cliente).
 */

/**
 * Compara nomes sem diferenciar maiúsculas de minúsculas ("acme" = "ACME"),
 * mas diferenciando acentos. Precisa ser a mesma no índice e nas consultas.
 */
export const COLLATION_NOME = { locale: 'pt', strength: 2 }

const schemaCliente = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Informe o nome do cliente.'],
      trim: true,
      maxlength: [
        TAMANHO_MAXIMO_NOME_CLIENTE,
        `O nome do cliente deve ter até ${TAMANHO_MAXIMO_NOME_CLIENTE} caracteres.`,
      ],
    },
  },
  { collection: 'cliente', versionKey: false },
)

// Nome único (sem diferenciar maiúsculas). É isso que impede dois clientes
// "Acme" quando dois projetos são salvos ao mesmo tempo.
schemaCliente.index({ nome: 1 }, { unique: true, collation: COLLATION_NOME })

export const Cliente = mongoose.model('Cliente', schemaCliente)
