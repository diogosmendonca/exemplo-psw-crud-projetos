import { constants } from 'node:fs'
import { copyFile, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { ambiente } from '../config/ambiente.js'

/**
 * Armazenamento dos projetos em um arquivo JSON.
 *
 * O arquivo tem o formato `{ "ultimoId": 3, "projetos": [...] }`. O conteúdo é
 * carregado na memória ao iniciar (`iniciarRepositorio`) e cada alteração é
 * gravada no arquivo antes de passar a valer. Assim, um erro de gravação nunca
 * deixa a memória diferente do arquivo.
 *
 * Edições manuais no arquivo só são lidas ao reiniciar a API.
 */

const ARQUIVO_EXEMPLO = path.join(ambiente.raizDoBackend, 'dados', 'projetos.exemplo.json')

// Último estado gravado com sucesso: `{ ultimoId, projetos }`.
let estado = null

// Fila que executa uma alteração por vez. Sem ela, duas requisições
// simultâneas leriam o mesmo estado e uma sobrescreveria a outra.
let fila = Promise.resolve()

function emSerie(operacao) {
  const resultado = fila.then(operacao)
  fila = resultado.catch(() => {})
  return resultado
}

async function lerArquivo() {
  const conteudo = await readFile(ambiente.arquivoDados, 'utf-8')

  let dados
  try {
    dados = JSON.parse(conteudo)
  } catch {
    throw new Error(`O arquivo de dados não contém um JSON válido: ${ambiente.arquivoDados}`)
  }

  if (!Array.isArray(dados?.projetos)) {
    throw new Error(
      `O arquivo de dados deve ter o formato { "ultimoId": 0, "projetos": [] }: ${ambiente.arquivoDados}`,
    )
  }

  // Garante que o próximo id nunca colida com um existente, mesmo que o
  // `ultimoId` tenha sido esquecido ou editado à mão.
  const maiorId = Math.max(0, ...dados.projetos.map((projeto) => projeto.id))
  const ultimoId = Math.max(maiorId, Number.isInteger(dados.ultimoId) ? dados.ultimoId : 0)

  return { ultimoId, projetos: dados.projetos }
}

/** Grava o novo estado de forma atômica e só então o adota. */
async function gravar(novoEstado) {
  const temporario = `${ambiente.arquivoDados}.tmp`
  await writeFile(temporario, `${JSON.stringify(novoEstado, null, 2)}\n`)
  // `rename` é atômico: o arquivo nunca fica pela metade, mesmo se a API cair.
  await rename(temporario, ambiente.arquivoDados)
  estado = novoEstado
}

/**
 * Prepara o arquivo de dados e carrega os projetos. Deve ser chamada (e
 * aguardada) antes de a API começar a receber requisições. Se o arquivo ainda
 * não existe, é criado a partir de `dados/projetos.exemplo.json`.
 */
export async function iniciarRepositorio() {
  await mkdir(path.dirname(ambiente.arquivoDados), { recursive: true })

  try {
    await copyFile(ARQUIVO_EXEMPLO, ambiente.arquivoDados, constants.COPYFILE_EXCL)
  } catch (erro) {
    // EEXIST: o arquivo já existe, que é o caso normal.
    if (erro.code !== 'EEXIST') throw erro
  }

  estado = await lerArquivo()
}

/** Lista todos os projetos. */
export function listarProjetos() {
  return estado.projetos
}

/** Busca um projeto pelo id (texto, como vem da URL). `undefined` se não existir. */
export function buscarProjeto(id) {
  return estado.projetos.find((projeto) => String(projeto.id) === id)
}

/** Cria um projeto com um novo id e o devolve. */
export function criarProjeto(dados) {
  return emSerie(async () => {
    const projeto = { id: estado.ultimoId + 1, ...dados }

    await gravar({
      ultimoId: projeto.id,
      projetos: [...estado.projetos, projeto],
    })

    return projeto
  })
}

/** Substitui os dados de um projeto. Devolve o projeto alterado, ou `null` se não existir. */
export function alterarProjeto(id, dados) {
  return emSerie(async () => {
    const atual = buscarProjeto(id)
    if (!atual) return null

    const alterado = { id: atual.id, ...dados }

    await gravar({
      ...estado,
      projetos: estado.projetos.map((projeto) => (projeto === atual ? alterado : projeto)),
    })

    return alterado
  })
}

/** Exclui um projeto. Devolve `true` se excluiu, `false` se ele não existia. */
export function excluirProjeto(id) {
  return emSerie(async () => {
    const atual = buscarProjeto(id)
    if (!atual) return false

    await gravar({
      ...estado,
      projetos: estado.projetos.filter((projeto) => projeto !== atual),
    })

    return true
  })
}
