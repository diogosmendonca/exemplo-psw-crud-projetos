import passport from 'passport'
import { BasicStrategy } from 'passport-http'
import { Strategy as EstrategiaLocal } from 'passport-local'
import { ambiente } from '../config/ambiente.js'
import { UsuarioJaCadastrado } from '../dao/UsuarioDAO.js'
import { conferirSenha, gerarHashDaSenha } from './senha.js'

const REALM = 'Gerenciador de Projetos'

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
 * Estratégia Basic do Passport: o navegador manda o nome de usuário e a senha
 * no cabeçalho `Authorization`. Não há sessão; cada requisição traz as
 * credenciais de novo. O hash é conferido com o bcrypt.
 *
 * @param {import('../dao/UsuarioDAO.js').UsuarioDAO} usuarios
 */
export function configurarAutenticacao(usuarios) {
  passport.use(
    'basic',
    new BasicStrategy({ realm: REALM }, async (nomeUsuario, senha, done) => {
      try {
        const encontrado = await usuarios.buscarParaAutenticacao(nomeUsuario.trim())

        if (!encontrado) return done(null, false)

        const { senhaHash, ...usuario } = encontrado
        done(null, (await conferirSenha(senha, senhaHash)) ? usuario : false)
      } catch (erro) {
        done(erro)
      }
    }),
  )
}

/**
 * Exige Basic Auth. Sem credencial válida, responde 401 com
 * `WWW-Authenticate`, que é o que faz o navegador abrir o prompt nativo.
 */
export function autenticar(requisicao, resposta, proximo) {
  // O preflight do CORS não traz a senha; quem autentica é a requisição seguinte.
  if (requisicao.method === 'OPTIONS') return proximo()

  passport.authenticate('basic', { session: false }, (erro, usuario) => {
    if (erro) return proximo(erro)

    if (!usuario) {
      resposta.set('WWW-Authenticate', `Basic realm="${REALM}"`)
      return resposta.status(401).json({ mensagem: 'É preciso se autenticar para acessar.' })
    }

    requisicao.user = usuario
    proximo()
  })(requisicao, resposta, proximo)
}

/** Depois que o prompt é aceito, volta para a aplicação. */
export function redirecionarAposAutenticacao(requisicao, resposta) {
  resposta.redirect(ambiente.origemPermitida ? `${ambiente.origemPermitida}/` : '/')
}
