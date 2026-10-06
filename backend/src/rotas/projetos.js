import { Router } from 'express'
import { projetos } from '../dados/projetos.js'
import { validarNovoProjeto } from '../validacoes/projeto.js'

export const rotasProjetos = Router()

// GET /projetos - lista todos os projetos.
rotasProjetos.get('/', (requisicao, resposta) => {
  resposta.json(projetos)
})

// POST /projetos - cria um projeto a partir do JSON do corpo da requisição.
// O id é sempre gerado pela API: um `id` enviado pelo cliente é ignorado.
rotasProjetos.post('/', (requisicao, resposta) => {
  const { projeto, erros } = validarNovoProjeto(requisicao.body)

  if (erros) {
    return resposta.status(400).json({ mensagem: 'Projeto inválido.', erros })
  }

  const id = Math.max(0, ...projetos.map((item) => item.id)) + 1
  const novoProjeto = { id, ...projeto }
  projetos.push(novoProjeto)

  resposta.status(201).location(`/projetos/${id}`).json(novoProjeto)
})
