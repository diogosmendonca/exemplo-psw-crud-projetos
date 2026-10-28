import { Router } from 'express'
import { validarProjeto } from '../validacoes/projeto.js'

const projetoNaoEncontrado = (resposta) =>
  resposta.status(404).json({ mensagem: 'Projeto não encontrado.' })

/** Administrador vê qualquer projeto. Gerente só vê o que está associado a ele. */
function projetoVisivel(usuario, projeto) {
  if (!projeto) return false
  if (usuario.perfil === 'administrador') return true

  return projeto.gerente?.id === usuario.id
}

/**
 * O gerente autenticado fica associado ao próprio usuário, mesmo que o corpo
 * traga outro id. O administrador precisa indicar um usuário de perfil gerente.
 *
 * @returns {Promise<string|null>} Mensagem de erro, ou `null` se o gerente foi definido.
 */
async function definirGerente(requisicao, projeto, usuarios) {
  if (requisicao.user.perfil === 'gerente') {
    projeto.gerenteId = requisicao.user.id
    return null
  }

  const gerente = await usuarios.buscarPorId(projeto.gerenteId)
  if (!gerente || gerente.perfil !== 'gerente') return 'Informe um gerente de projetos.'

  return null
}

/**
 * Rotas de projetos. Recebem o DAO em vez de importá-lo: elas não sabem (nem
 * precisam saber) se os dados estão no MongoDB ou no PostgreSQL.
 *
 * @param {import('../dao/ProjetoDAO.js').ProjetoDAO} projetos
 * @param {import('../dao/UsuarioDAO.js').UsuarioDAO} usuarios
 */
export function criarRotasProjetos(projetos, usuarios) {
  const rotas = Router()

  // GET /projetos - o administrador lista todos; o gerente, só os dele.
  rotas.get('/', async (requisicao, resposta) => {
    const gerenteId = requisicao.user.perfil === 'gerente' ? requisicao.user.id : undefined

    resposta.json(await projetos.listar(gerenteId))
  })

  // GET /projetos/:id - devolve os dados de um projeto visível para quem pediu.
  rotas.get('/:id', async (requisicao, resposta) => {
    const projeto = await projetos.buscarPorId(requisicao.params.id)

    if (!projetoVisivel(requisicao.user, projeto)) return projetoNaoEncontrado(resposta)

    resposta.json(projeto)
  })

  // POST /projetos - cria um projeto a partir do JSON do corpo da requisição.
  // O id é sempre gerado pelo banco: um `id` enviado pelo cliente é ignorado.
  rotas.post('/', async (requisicao, resposta) => {
    const { projeto, erros } = validarProjeto(requisicao.body)

    if (erros) {
      return resposta.status(400).json({ mensagem: 'Projeto inválido.', erros })
    }

    const erroDoGerente = await definirGerente(requisicao, projeto, usuarios)
    if (erroDoGerente) {
      return resposta.status(400).json({ mensagem: 'Projeto inválido.', erros: [erroDoGerente] })
    }

    const novoProjeto = await projetos.criar(projeto)

    resposta.status(201).location(`/projetos/${novoProjeto.id}`).json(novoProjeto)
  })

  // PUT /projetos/:id - substitui os dados do projeto pelo JSON do corpo.
  // O id vem da URL e nunca muda: um `id` no corpo é ignorado.
  rotas.put('/:id', async (requisicao, resposta) => {
    const { id } = requisicao.params
    const existente = await projetos.buscarPorId(id)

    if (!projetoVisivel(requisicao.user, existente)) return projetoNaoEncontrado(resposta)

    const { projeto, erros } = validarProjeto(requisicao.body)

    if (erros) {
      return resposta.status(400).json({ mensagem: 'Projeto inválido.', erros })
    }

    const erroDoGerente = await definirGerente(requisicao, projeto, usuarios)
    if (erroDoGerente) {
      return resposta.status(400).json({ mensagem: 'Projeto inválido.', erros: [erroDoGerente] })
    }

    const projetoAlterado = await projetos.alterar(id, projeto)

    // `null`: o projeto foi excluído por outra requisição entre a checagem e a alteração.
    if (!projetoAlterado) return projetoNaoEncontrado(resposta)

    resposta.json(projetoAlterado)
  })

  // DELETE /projetos/:id - exclui o projeto, se quem pediu puder vê-lo.
  rotas.delete('/:id', async (requisicao, resposta) => {
    const projeto = await projetos.buscarPorId(requisicao.params.id)

    if (!projetoVisivel(requisicao.user, projeto)) return projetoNaoEncontrado(resposta)

    const excluiu = await projetos.excluir(requisicao.params.id)

    if (!excluiu) return projetoNaoEncontrado(resposta)

    resposta.status(204).end()
  })

  return rotas
}
