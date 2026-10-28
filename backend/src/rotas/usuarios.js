import { Router } from 'express'
import { cadastrar, configurarCadastro } from '../autenticacao/passport.js'
import { gerarHashDaSenha } from '../autenticacao/senha.js'
import { UsuarioJaCadastrado } from '../dao/UsuarioDAO.js'
import { validarAlteracao, validarUsuario } from '../validacoes/usuario.js'

const usuarioNaoEncontrado = (resposta) =>
  resposta.status(404).json({ mensagem: 'Usuário não encontrado.' })

/**
 * CRUD de usuários. Só o administrador chega aqui (`exigirAdministrador` na aplicação).
 *
 * @param {import('../dao/UsuarioDAO.js').UsuarioDAO} usuarios
 * @param {import('../dao/ProjetoDAO.js').ProjetoDAO} projetos
 */
export function criarRotasUsuarios(usuarios, projetos) {
  configurarCadastro(usuarios)

  const rotas = Router()

  rotas.get('/', async (requisicao, resposta) => {
    resposta.json(await usuarios.listar())
  })

  rotas.get('/:id', async (requisicao, resposta) => {
    const usuario = await usuarios.buscarPorId(requisicao.params.id)

    if (!usuario) return usuarioNaoEncontrado(resposta)

    resposta.json(usuario)
  })

  rotas.post('/', (requisicao, resposta, proximo) => {
    const { usuario, erros } = validarUsuario(requisicao.body)

    if (erros) {
      return resposta.status(400).json({ mensagem: 'Usuário inválido.', erros })
    }

    requisicao.body = usuario
    cadastrar(requisicao, resposta, proximo)
  })

  rotas.put('/:id', async (requisicao, resposta, proximo) => {
    const { id } = requisicao.params
    const existente = await usuarios.buscarPorId(id)

    if (!existente) return usuarioNaoEncontrado(resposta)

    const { usuario, erros } = validarAlteracao(requisicao.body)

    if (erros) {
      return resposta.status(400).json({ mensagem: 'Usuário inválido.', erros })
    }

    if (requisicao.user.id === id && usuario.perfil !== requisicao.user.perfil) {
      return resposta.status(409).json({ mensagem: 'Você não pode alterar o próprio perfil.' })
    }

    const { senha, ...dados } = usuario
    if (senha) dados.senhaHash = await gerarHashDaSenha(senha)

    try {
      const alterado = await usuarios.alterar(id, dados)

      if (!alterado) return usuarioNaoEncontrado(resposta)

      resposta.json(alterado)
    } catch (erro) {
      if (erro instanceof UsuarioJaCadastrado) {
        return resposta.status(409).json({ mensagem: erro.message, campo: erro.campo })
      }

      proximo(erro)
    }
  })

  rotas.delete('/:id', async (requisicao, resposta, proximo) => {
    const { id } = requisicao.params

    if (requisicao.user.id === id) {
      return resposta.status(409).json({ mensagem: 'Você não pode excluir a própria conta.' })
    }

    if (await projetos.existeDoGerente(id)) {
      return resposta.status(409).json({
        mensagem:
          'Este gerente tem projetos associados. Associe esses projetos a outro gerente antes de excluir.',
      })
    }

    try {
      const excluiu = await usuarios.excluir(id)

      if (!excluiu) return usuarioNaoEncontrado(resposta)

      resposta.status(204).end()
    } catch (erro) {
      proximo(erro)
    }
  })

  return rotas
}
