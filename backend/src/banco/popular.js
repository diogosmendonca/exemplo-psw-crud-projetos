import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { ambiente } from '../config/ambiente.js'
import { conectarMongo, desconectarMongo } from './conexao.js'
import { Projeto } from '../modelos/projeto.js'
import { validarProjeto } from '../validacoes/projeto.js'

/**
 * Importa projetos de um arquivo JSON para o MongoDB (`npm run mongo:popular`).
 *
 * Sem argumento usa `dados/projetos.exemplo.json`. Para importar outro arquivo:
 * `npm run mongo:popular -- dados/projetos.json`. Aceita `{ "projetos": [...] }`
 * ou uma lista direta. Os `id` do arquivo são descartados: o MongoDB gera os seus.
 *
 * Só importa se a coleção estiver vazia, então rodar duas vezes não duplica nada.
 */

const arquivo = path.resolve(
  ambiente.raizDoBackend,
  process.argv[2] ?? 'dados/projetos.exemplo.json',
)

try {
  const dados = JSON.parse(await readFile(arquivo, 'utf-8'))
  const lista = Array.isArray(dados) ? dados : dados.projetos

  if (!Array.isArray(lista)) {
    throw new Error('o arquivo deve conter uma lista de projetos ou { "projetos": [...] }')
  }

  const projetos = lista.map((item, posicao) => {
    const { projeto, erros } = validarProjeto(item)
    if (erros) throw new Error(`projeto ${posicao + 1} inválido: ${erros.join(' ')}`)
    return projeto
  })

  await conectarMongo()

  const existentes = await Projeto.countDocuments()
  if (existentes > 0) {
    console.log(`A coleção já tem ${existentes} projeto(s): nada foi importado.`)
  } else {
    await Projeto.insertMany(projetos)
    console.log(`✔ ${projetos.length} projeto(s) importado(s) de ${path.relative(process.cwd(), arquivo)}.`)
  }
} catch (erro) {
  console.error(`✘ ${erro.message}`)
  process.exitCode = 1
} finally {
  await desconectarMongo()
}
