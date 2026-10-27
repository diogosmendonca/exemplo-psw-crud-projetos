import passport from 'passport'
import { Strategy as EstrategiaLocal } from 'passport-local'
import { UsuarioJaCadastrado } from '../dao/UsuarioDAO.js'
import { conferirSenha, gerarHashDaSenha } from './senha.js'

const MENSAGEM_LOGIN = 'Usuário ou senha inválidos.'

/**
 * Estratégia de cadastro do Passport.
 *
 * O Passport não gera hash: ele organiza o fluxo (recebe nome de usuário e
 * senha, chama este verificador e devolve o usuário ou a falha). O hash é
 * feito aqui com o bcrypt, antes de o DAO gravar. O cadastro não abre sessão.
 *
 * @param {import('../dao/UsuarioDAO.js').UsuarioDAO} usuarios
 */
export function configurarCadastro(usuarios) {
  passport.use(
    'cadastro',
    new EstrategiaLocal(
      {
        usernameField: 'nomeUsuario',
        passwordField: 'senha',
        passReqToCallback: true,
      },
      async (requisicao, nomeUsuario, senha, done) => {
        try {
          const { nome, email, perfil } = requisicao.body
          const senhaHash = await gerarHashDaSenha(senha)
          const usuario = await usuarios.criar({ nome, email, nomeUsuario, senhaHash, perfil })

          done(null, usuario)
        } catch (erro) {
          if (erro instanceof UsuarioJaCadastrado) {
            done(null, false, { message: erro.message, campo: erro.campo })
            return
          }

          done(erro)
        }
      },
    ),
  )
}

/**
 * Middleware do `POST /usuarios`. O corpo já foi validado pela rota; aqui o
 * Passport executa a estratégia `cadastro`.
 */
export function cadastrar(requisicao, resposta, proximo) {
  passport.authenticate('cadastro', { session: false }, (erro, usuario, info) => {
    if (erro) return proximo(erro)

    if (!usuario) {
      return resposta.status(409).json({
        mensagem: info?.message ?? 'Não foi possível cadastrar o usuário.',
        campo: info?.campo,
      })
    }

    resposta.status(201).location(`/usuarios/${usuario.id}`).json(usuario)
  })(requisicao, resposta, proximo)
}

/**
 * Estratégia local do Passport, usada no login. O nome de usuário e a senha
 * vêm do corpo do `POST /api/sessao` (a tela de entrada), uma única vez. A
 * sessão guarda o id; as requisições seguintes mandam só o cookie.
 *
 * @param {import('../dao/UsuarioDAO.js').UsuarioDAO} usuarios
 */
export function configurarAutenticacao(usuarios) {
  passport.use(
    'local',
    new EstrategiaLocal(
      { usernameField: 'nomeUsuario', passwordField: 'senha' },
      async (nomeUsuario, senha, done) => {
        try {
          const encontrado = await usuarios.buscarParaAutenticacao(nomeUsuario)

          if (!encontrado) return done(null, false, { message: MENSAGEM_LOGIN })

          const { senhaHash, ...usuario } = encontrado
          const confere = await conferirSenha(senha, senhaHash)

          done(null, confere ? usuario : false, confere ? undefined : { message: MENSAGEM_LOGIN })
        } catch (erro) {
          done(erro)
        }
      },
    ),
  )

  // O cookie não leva o usuário inteiro: só o id. A cada requisição o Passport
  // busca o usuário de novo.
  passport.serializeUser((usuario, done) => done(null, usuario.id))
  passport.deserializeUser(async (id, done) => {
    try {
      done(null, await usuarios.buscarPorId(id))
    } catch (erro) {
      done(erro)
    }
  })
}

/**
 * Exige uma sessão autenticada. A tela de entrada e o `POST /api/sessao`
 * ficam de fora. O preflight do CORS também passa sem sessão.
 */
export function autenticar(requisicao, resposta, proximo) {
  if (requisicao.method === 'OPTIONS') return proximo()
  if (requisicao.isAuthenticated()) return proximo()

  resposta.status(401).json({ mensagem: 'É preciso entrar para acessar.' })
}

/**
 * Login. O corpo já foi validado. O Passport confere a senha e, se estiver
 * certa, grava o id do usuário na sessão (`req.login`).
 */
export function entrar(requisicao, resposta, proximo) {
  passport.authenticate('local', (erro, usuario, info) => {
    if (erro) return proximo(erro)

    if (!usuario) {
      return resposta.status(401).json({ mensagem: info?.message ?? MENSAGEM_LOGIN })
    }

    requisicao.login(usuario, (erroLogin) => {
      if (erroLogin) return proximo(erroLogin)
      resposta.json(usuario)
    })
  })(requisicao, resposta, proximo)
}
