import { Router } from 'express'
import { projetos } from '../dados/projetos.js'

export const rotasProjetos = Router()

// GET /projetos - lista todos os projetos.
rotasProjetos.get('/', (requisicao, resposta) => {
  resposta.json(projetos)
})
