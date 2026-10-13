import { Router } from 'express'
import { listarClientes } from '../repositorio/clientes.js'

export const rotasClientes = Router()

// GET /clientes - lista os clientes já cadastrados, em ordem alfabética.
// Não há POST: um cliente é criado ao salvar um projeto com um cliente novo.
rotasClientes.get('/', async (requisicao, resposta) => {
  resposta.json(await listarClientes())
})
