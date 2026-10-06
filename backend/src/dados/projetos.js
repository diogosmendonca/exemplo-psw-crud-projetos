// Projetos guardados em memória. Servem de "banco de dados" provisório:
// ao reiniciar a API, voltam a ser exatamente estes.
export const projetos = [
  {
    id: 1,
    nome: 'Portal do Aluno',
    status: 'ativo',
    descricao: 'Portal web para consulta de notas, faltas e horários.',
    tecnologias: ['React', 'Vite', 'Bootstrap'],
    url: 'https://exemplo.com/portal-do-aluno',
  },
  {
    id: 2,
    nome: 'API de Biblioteca',
    status: 'ativo',
    descricao: 'Serviço REST para controle de acervo e empréstimos.',
    tecnologias: ['Node.js', 'Express', 'PostgreSQL'],
    url: '',
  },
  {
    id: 3,
    nome: 'Sistema de Estoque Legado',
    status: 'inativo',
    descricao: '',
    tecnologias: ['PHP'],
    url: '',
  },
]
