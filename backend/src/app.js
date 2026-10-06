import cors from 'cors'
import express from 'express'
import { ambiente } from './config/ambiente.js'
import { naoEncontrado } from './middlewares/naoEncontrado.js'
import { tratadorDeErros } from './middlewares/tratadorDeErros.js'

/**
 * Monta a aplicação Express (sem subir o servidor, o que facilita testes).
 * As rotas da API serão registradas aqui, entre os middlewares globais e o
 * `naoEncontrado`.
 */
export function criarApp() {
  const app = express()

  app.use(cors({ origin: ambiente.origemPermitida }))
  app.use(express.json())

  // As rotas serão registradas aqui.

  app.use(naoEncontrado)
  app.use(tratadorDeErros)

  return app
}
