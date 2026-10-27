import mongoose from 'mongoose'
import {
  PERFIS_USUARIO,
  TAMANHO_MAXIMO_NOME_DE_USUARIO,
  TAMANHO_MAXIMO_NOME_USUARIO,
} from '@gerenciador-de-projetos/compartilhado'
import { COLLATION_NOME } from './cliente.js'

/**
 * Schema e modelo do usuário, na coleção `usuario`.
 *
 * A senha fica só como `senhaHash` (bcrypt). O documento nunca é devolvido
 * direto na API: o DAO monta a resposta sem esse campo.
 */

const schemaUsuario = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Informe o nome.'],
      trim: true,
      maxlength: TAMANHO_MAXIMO_NOME_USUARIO,
    },
    // Gravado em minúsculas: "Ana@Exemplo.com" e "ana@exemplo.com" são o mesmo e-mail.
    email: {
      type: String,
      required: [true, 'Informe o e-mail.'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    nomeUsuario: {
      type: String,
      required: [true, 'Informe o nome de usuário.'],
      trim: true,
      maxlength: TAMANHO_MAXIMO_NOME_DE_USUARIO,
    },
    senhaHash: { type: String, required: true },
    perfil: { type: String, required: true, enum: PERFIS_USUARIO },
  },
  { collection: 'usuario', versionKey: false },
)

// Único sem diferenciar maiúsculas ("Ana" = "ana"). O e-mail não precisa disto:
// ele já é gravado em minúsculas.
schemaUsuario.index({ nomeUsuario: 1 }, { unique: true, collation: COLLATION_NOME })

export const Usuario = mongoose.model('Usuario', schemaUsuario)
