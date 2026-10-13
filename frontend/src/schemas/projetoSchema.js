import { schemaNomeCliente, schemaProjeto } from '@gerenciador-de-projetos/compartilhado'
import { z } from 'zod'

/** Valor da opção "Novo cliente…" do select de cliente (não é um nome de cliente). */
export const NOVO_CLIENTE = '__novo__'

// Parte do mesmo schema que o back-end usa para validar a API (nome, estado,
// descrição e URL com as mesmas regras e mensagens) e troca só os campos que
// têm outro formato no formulário.
const schemaFormularioProjeto = schemaProjeto
  .extend({
    // '' (sem cliente), o nome de um cliente existente ou `NOVO_CLIENTE`.
    cliente: z.string(),
    // Só vale quando `cliente` é `NOVO_CLIENTE`: o nome do cliente a cadastrar.
    novoCliente: schemaNomeCliente,
    // Texto separado por vírgulas; vira lista ao enviar.
    tecnologias: z.string(),
  })
  .superRefine((dados, contexto) => {
    if (dados.cliente === NOVO_CLIENTE && dados.novoCliente === '') {
      contexto.addIssue({
        code: 'custom',
        path: ['novoCliente'],
        message: 'Informe o nome do novo cliente.',
      })
    }
  })

export default schemaFormularioProjeto
