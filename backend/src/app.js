import cors from 'cors'
import express from 'express'
import { ambiente } from './config/ambiente.js'
import { frontendEstatico } from './middlewares/frontendEstatico.js'
import { naoEncontrado } from './middlewares/naoEncontrado.js'
import { tratadorDeErros } from './middlewares/tratadorDeErros.js'
import { criarRotasClientes } from './rotas/clientes.js'
import { criarRotasProjetos } from './rotas/projetos.js'

/**
 * Monta a aplicação Express (sem subir o servidor, o que facilita testes).
 *
 * Ordem importa: a API (`/api`) vem primeiro; depois o front-end compilado, se
 * existir; por fim o 404 e o tratador de erros.
 *
 * @param {{ projetos: import('./dao/ProjetoDAO.js').ProjetoDAO, clientes: import('./dao/ClienteDAO.js').ClienteDAO }} daos
 *   DAOs do banco escolhido (veja `criarFonteDeDados` em `dao/index.js`).
 */
export function criarApp({ projetos, clientes }) {
  const app = express()

  // Só em desenvolvimento (ou com CORS_ORIGIN definido). Em produção o
  // front-end é servido por esta mesma aplicação e não precisa de CORS.
  if (ambiente.origemPermitida) {
    app.use(cors({ origin: ambiente.origemPermitida }))
  }

  app.use(express.json())

  app.use('/api/projetos', criarRotasProjetos(projetos))
  app.use('/api/clientes', criarRotasClientes(clientes))
  // Rota desconhecida sob /api: 404 em JSON, nunca a página do front-end.
  app.use('/api', naoEncontrado)

  const frontend = frontendEstatico()
  if (frontend) app.use(frontend)

  app.use(naoEncontrado)
  app.use(tratadorDeErros)

  return app
}
