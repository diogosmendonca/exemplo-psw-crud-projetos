import { Router } from 'express'

/** @param {import('../dao/ClienteDAO.js').ClienteDAO} clientes */
export function criarRotasClientes(clientes) {
  const rotas = Router()

  // GET /clientes - lista os clientes já cadastrados, em ordem alfabética.
  // Não há POST: um cliente é criado ao salvar um projeto com um cliente novo.
  rotas.get('/', async (requisicao, resposta) => {
    resposta.json(await clientes.listar())
  })

  return rotas
}
