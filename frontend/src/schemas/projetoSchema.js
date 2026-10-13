import { z } from 'zod'

const schemaProjeto = z.object({
  nome: z.string().trim().min(1, 'Informe o nome do projeto.'),
  status: z.enum(['ativo', 'inativo'], {
    error: 'Selecione o estado do projeto.',
  }),
  // Opcional. O nome de um cliente existente ou de um novo (criado ao salvar).
  cliente: z.string().trim().max(100, 'O nome do cliente deve ter até 100 caracteres.'),
  descricao: z.string(),
  tecnologias: z.string(),
  url: z.string().trim().refine(
    (valor) => valor === '' || z.url().safeParse(valor).success,
    'Informe uma URL válida.',
  ),
})

export default schemaProjeto
