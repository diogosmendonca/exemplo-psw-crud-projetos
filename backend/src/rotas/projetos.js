import { Router } from 'express'
import { projetos, proximoId } from '../dados/projetos.js'
import { validarProjeto } from '../validacoes/projeto.js'

export const rotasProjetos = Router()

/** Posição do projeto na lista, ou -1 se o id não existir (ou não for numérico). */
function indiceDoProjeto(id) {
  return projetos.findIndex((projeto) => String(projeto.id) === id)
}

// GET /projetos - lista todos os projetos.
rotasProjetos.get('/', (requisicao, resposta) => {
  resposta.json(projetos)
})

// GET /projetos/:id - devolve os dados de um projeto.
rotasProjetos.get('/:id', (requisicao, resposta) => {
  const indice = indiceDoProjeto(requisicao.params.id)

  if (indice === -1) {
    return resposta.status(404).json({ mensagem: 'Projeto não encontrado.' })
  }

  resposta.json(projetos[indice])
})

// POST /projetos - cria um projeto a partir do JSON do corpo da requisição.
// O id é sempre gerado pela API (nunca reaproveita ids excluídos): um `id`
// enviado pelo cliente é ignorado.
rotasProjetos.post('/', (requisicao, resposta) => {
  const { projeto, erros } = validarProjeto(requisicao.body)

  if (erros) {
    return resposta.status(400).json({ mensagem: 'Projeto inválido.', erros })
  }

  const novoProjeto = { id: proximoId(), ...projeto }
  projetos.push(novoProjeto)

  resposta.status(201).location(`/projetos/${novoProjeto.id}`).json(novoProjeto)
})

// PUT /projetos/:id - substitui os dados do projeto pelo JSON do corpo.
// O id vem da URL e nunca muda: um `id` no corpo é ignorado.
rotasProjetos.put('/:id', (requisicao, resposta) => {
  const indice = indiceDoProjeto(requisicao.params.id)

  if (indice === -1) {
    return resposta.status(404).json({ mensagem: 'Projeto não encontrado.' })
  }

  const { projeto, erros } = validarProjeto(requisicao.body)

  if (erros) {
    return resposta.status(400).json({ mensagem: 'Projeto inválido.', erros })
  }

  const projetoAlterado = { id: projetos[indice].id, ...projeto }
  projetos[indice] = projetoAlterado

  resposta.json(projetoAlterado)
})

// DELETE /projetos/:id - exclui o projeto da lista.
rotasProjetos.delete('/:id', (requisicao, resposta) => {
  const indice = indiceDoProjeto(requisicao.params.id)

  if (indice === -1) {
    return resposta.status(404).json({ mensagem: 'Projeto não encontrado.' })
  }

  projetos.splice(indice, 1)

  resposta.status(204).end()
})
