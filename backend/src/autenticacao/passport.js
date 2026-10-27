import passport from 'passport'
import { ExtractJwt, Strategy as EstrategiaJwt } from 'passport-jwt'
import { Strategy as EstrategiaLocal } from 'passport-local'
import { UsuarioJaCadastrado } from '../dao/UsuarioDAO.js'
import { ambiente } from '../config/ambiente.js'
import { conferirSenha, gerarHashDaSenha } from './senha.js'
import { gerarToken } from './token.js'

const MENSAGEM_LOGIN = 'Usuário ou senha inválidos.'

/**
 * Estratégia de cadastro do Passport.
 *
 * O Passport não gera hash: ele organiza o fluxo (recebe nome de usuário e
 * senha, chama este verificador e devolve o usuário ou a falha). O hash é
 * feito aqui com o bcrypt, antes de o DAO gravar. O cadastro não devolve token.
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
 * Duas estratégias do Passport.
 *
 * A local só roda no login: confere nome de usuário e senha e, se estiver
 * certo, a rota assina um JWT. A estratégia JWT protege o resto da API. Ela
 * lê o token do cabeçalho `Authorization: Bearer` e busca o usuário pelo id
 * que está no token (`sub`). Não há sessão no servidor.
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

  passport.use(
    'jwt',
    new EstrategiaJwt(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: ambiente.segredoDoJwt,
      },
      async (payload, done) => {
        try {
          const usuario = await usuarios.buscarPorId(payload.sub)
          done(null, usuario ?? false)
        } catch (erro) {
          done(erro)
        }
      },
    ),
  )
}

/**
 * Exige um JWT válido. A tela de entrada e o `POST /api/token` ficam de fora.
 * O preflight do CORS também passa sem token.
 */
export function autenticar(requisicao, resposta, proximo) {
  if (requisicao.method === 'OPTIONS') return proximo()

  passport.authenticate('jwt', { session: false }, (erro, usuario) => {
    if (erro) return proximo(erro)
    if (!usuario) {
      return resposta.status(401).json({ mensagem: 'É preciso entrar para acessar.' })
    }

    requisicao.user = usuario
    proximo()
  })(requisicao, resposta, proximo)
}

/**
 * Login. O corpo já foi validado. O Passport confere a senha com a estratégia
 * local e, se estiver certa, devolve o JWT e o usuário. O token não fica
 * gravado no servidor.
 */
export function entrar(requisicao, resposta, proximo) {
  passport.authenticate('local', { session: false }, (erro, usuario, info) => {
    if (erro) return proximo(erro)

    if (!usuario) {
      return resposta.status(401).json({ mensagem: info?.message ?? MENSAGEM_LOGIN })
    }

    resposta.json({ token: gerarToken(usuario), usuario })
  })(requisicao, resposta, proximo)
}
