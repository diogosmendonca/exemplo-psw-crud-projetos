import { schemaUsuario } from '@gerenciador-de-projetos/compartilhado'
import { z } from 'zod'

// O mesmo schema da API, mais a confirmação da senha, que só existe na tela:
// ela não é enviada e o back-end a descarta se vier.
const schemaFormularioUsuario = schemaUsuario
  .extend({
    confirmarSenha: z.string(),
  })
  .superRefine((dados, contexto) => {
    if (dados.senha !== dados.confirmarSenha) {
      contexto.addIssue({
        code: 'custom',
        path: ['confirmarSenha'],
        message: 'A confirmação da senha não confere.',
      })
    }
  })

export default schemaFormularioUsuario
