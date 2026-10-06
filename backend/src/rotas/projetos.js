import { Router } from 'express'
import {
  alterarProjeto,
  buscarProjeto,
  criarProjeto,
  excluirProjeto,
  listarProjetos,
} from '../repositorio/projetos.js'
import { validarProjeto } from '../validacoes/projeto.js'

export const rotasProjetos = Router()

const projetoNaoEncontrado = (resposta) =>
  resposta.status(404).json({ mensagem: 'Projeto não encontrado.' })

// GET /projetos - lista todos os projetos.
rotasProjetos.get('/', (requisicao, resposta) => {
  resposta.json(listarProjetos())
})

// GET /projetos/:id - devolve os dados de um projeto.
rotasProjetos.get('/:id', (requisicao, resposta) => {
  const projeto = buscarProjeto(requisicao.params.id)

  if (!projeto) return projetoNaoEncontrado(resposta)

  resposta.json(projeto)
})

// POST /projetos - cria um projeto a partir do JSON do corpo da requisição.
// O id é sempre gerado pela API (nunca reaproveita ids excluídos): um `id`
// enviado pelo cliente é ignorado.
rotasProjetos.post('/', async (requisicao, resposta) => {
  const { projeto, erros } = validarProjeto(requisicao.body)

  if (erros) {
    return resposta.status(400).json({ mensagem: 'Projeto inválido.', erros })
  }

  const novoProjeto = await criarProjeto(projeto)

  resposta.status(201).location(`/projetos/${novoProjeto.id}`).json(novoProjeto)
})

// PUT /projetos/:id - substitui os dados do projeto pelo JSON do corpo.
// O id vem da URL e nunca muda: um `id` no corpo é ignorado.
rotasProjetos.put('/:id', async (requisicao, resposta) => {
  const { id } = requisicao.params

  if (!buscarProjeto(id)) return projetoNaoEncontrado(resposta)

  const { projeto, erros } = validarProjeto(requisicao.body)

  if (erros) {
    return resposta.status(400).json({ mensagem: 'Projeto inválido.', erros })
  }

  const projetoAlterado = await alterarProjeto(id, projeto)

  // `null`: o projeto foi excluído por outra requisição entre a checagem e a gravação.
  if (!projetoAlterado) return projetoNaoEncontrado(resposta)

  resposta.json(projetoAlterado)
})

// DELETE /projetos/:id - exclui o projeto.
rotasProjetos.delete('/:id', async (requisicao, resposta) => {
  const excluiu = await excluirProjeto(requisicao.params.id)

  if (!excluiu) return projetoNaoEncontrado(resposta)

  resposta.status(204).end()
})
