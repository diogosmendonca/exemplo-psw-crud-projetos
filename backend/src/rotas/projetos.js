import { Router } from 'express'
import { validarProjeto } from '../validacoes/projeto.js'

const projetoNaoEncontrado = (resposta) =>
  resposta.status(404).json({ mensagem: 'Projeto não encontrado.' })

/**
 * Rotas de projetos. Recebem o DAO em vez de importá-lo: elas não sabem (nem
 * precisam saber) se os dados estão no MongoDB ou no PostgreSQL.
 *
 * @param {import('../dao/ProjetoDAO.js').ProjetoDAO} projetos
 */
export function criarRotasProjetos(projetos) {
  const rotas = Router()

  // GET /projetos - lista todos os projetos.
  rotas.get('/', async (requisicao, resposta) => {
    resposta.json(await projetos.listar())
  })

  // GET /projetos/:id - devolve os dados de um projeto.
  rotas.get('/:id', async (requisicao, resposta) => {
    const projeto = await projetos.buscarPorId(requisicao.params.id)

    if (!projeto) return projetoNaoEncontrado(resposta)

    resposta.json(projeto)
  })

  // POST /projetos - cria um projeto a partir do JSON do corpo da requisição.
  // O id é sempre gerado pelo banco: um `id` enviado pelo cliente é ignorado.
  rotas.post('/', async (requisicao, resposta) => {
    const { projeto, erros } = validarProjeto(requisicao.body)

    if (erros) {
      return resposta.status(400).json({ mensagem: 'Projeto inválido.', erros })
    }

    const novoProjeto = await projetos.criar(projeto)

    resposta.status(201).location(`/projetos/${novoProjeto.id}`).json(novoProjeto)
  })

  // PUT /projetos/:id - substitui os dados do projeto pelo JSON do corpo.
  // O id vem da URL e nunca muda: um `id` no corpo é ignorado.
  rotas.put('/:id', async (requisicao, resposta) => {
    const { id } = requisicao.params

    if (!(await projetos.buscarPorId(id))) return projetoNaoEncontrado(resposta)

    const { projeto, erros } = validarProjeto(requisicao.body)

    if (erros) {
      return resposta.status(400).json({ mensagem: 'Projeto inválido.', erros })
    }

    const projetoAlterado = await projetos.alterar(id, projeto)

    // `null`: o projeto foi excluído por outra requisição entre a checagem e a alteração.
    if (!projetoAlterado) return projetoNaoEncontrado(resposta)

    resposta.json(projetoAlterado)
  })

  // DELETE /projetos/:id - exclui o projeto.
  rotas.delete('/:id', async (requisicao, resposta) => {
    const excluiu = await projetos.excluir(requisicao.params.id)

    if (!excluiu) return projetoNaoEncontrado(resposta)

    resposta.status(204).end()
  })

  return rotas
}
