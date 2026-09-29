import { z } from 'zod'

const schemaProjeto = z.object({
  nome: z.string().trim().min(1, 'Informe o nome do projeto.'),
  status: z.enum(['ativo', 'inativo'], {
    error: 'Selecione o estado do projeto.',
  }),
  descricao: z.string(),
  tecnologias: z.string(),
  url: z.string().trim().refine(
    (valor) => valor === '' || z.url().safeParse(valor).success,
    'Informe uma URL válida.',
  ),
})

export default schemaProjeto
