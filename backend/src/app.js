import cors from 'cors'
import express from 'express'
import passport from 'passport'
import { autenticar, configurarAutenticacao, redirecionarAposAutenticacao } from './autenticacao/passport.js'
import { ambiente } from './config/ambiente.js'
import { frontendEstatico } from './middlewares/frontendEstatico.js'
import { naoEncontrado } from './middlewares/naoEncontrado.js'
import { tratadorDeErros } from './middlewares/tratadorDeErros.js'
import { criarRotasClientes } from './rotas/clientes.js'
import { criarRotasProjetos } from './rotas/projetos.js'
import { criarRotasUsuarios } from './rotas/usuarios.js'

/**
 * Monta a aplicação Express (sem subir o servidor, o que facilita testes).
 *
 * Ordem importa: a API (`/api`) vem primeiro; depois o front-end compilado, se
 * existir; por fim o 404 e o tratador de erros.
 *
 * @param {{ projetos: import('./dao/ProjetoDAO.js').ProjetoDAO, clientes: import('./dao/ClienteDAO.js').ClienteDAO, usuarios: import('./dao/UsuarioDAO.js').UsuarioDAO }} daos
 *   DAOs do banco escolhido (veja `criarFonteDeDados` em `dao/index.js`).
 */
export function criarApp({ projetos, clientes, usuarios }) {
  const app = express()

  // Só em desenvolvimento (ou com CORS_ORIGIN definido). Em produção o
  // front-end é servido por esta mesma aplicação e não precisa de CORS.
  if (ambiente.origemPermitida) {
    app.use(cors({ origin: ambiente.origemPermitida }))
  }

  app.use(express.json())
  // Sem sessão: o Basic Auth manda o usuário e a senha em toda requisição.
  app.use(passport.initialize())
  configurarAutenticacao(usuarios)
  app.use(autenticar)

  // A tela não tem formulário de login. Esta rota, pedida pelo navegador,
  // devolve 401 e o prompt nativo; autenticado, volta para a aplicação.
  app.get('/autenticar', redirecionarAposAutenticacao)

  app.use('/api/projetos', criarRotasProjetos(projetos))
  app.use('/api/clientes', criarRotasClientes(clientes))
  app.use('/api/usuarios', criarRotasUsuarios(usuarios))
  // Rota desconhecida sob /api: 404 em JSON, nunca a página do front-end.
  app.use('/api', naoEncontrado)

  const frontend = frontendEstatico()
  if (frontend) app.use(frontend)

  app.use(naoEncontrado)
  app.use(tratadorDeErros)

  return app
}
