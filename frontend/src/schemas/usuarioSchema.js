import { schemaRegistro, schemaUsuario, schemaUsuarioAlteracao } from '@gerenciador-de-projetos/compartilhado'
import { z } from 'zod'

function conferirConfirmacao(dados, contexto) {
  const senha = dados.senha ?? ''
  const confirmacao = dados.confirmarSenha ?? ''

  if (senha === '' && confirmacao === '') return

  if (senha !== confirmacao) {
    contexto.addIssue({
      code: 'custom',
      path: ['confirmarSenha'],
      message: 'A confirmação da senha não confere.',
    })
  }
}

// A confirmação só existe na tela: ela não é enviada e o back-end a descarta se vier.
const schemaFormularioUsuario = schemaUsuario
  .extend({ confirmarSenha: z.string() })
  .superRefine(conferirConfirmacao)

export const schemaFormularioRegistro = schemaRegistro
  .extend({ confirmarSenha: z.string() })
  .superRefine(conferirConfirmacao)

export const schemaFormularioAlteracao = schemaUsuarioAlteracao
  .extend({ confirmarSenha: z.string() })
  .superRefine(conferirConfirmacao)

export default schemaFormularioUsuario
