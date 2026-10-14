import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { ambiente } from '../config/ambiente.js'
import { criarFonteDeDados } from '../dao/index.js'
import { validarProjeto } from '../validacoes/projeto.js'

/**
 * Importa projetos de um arquivo JSON para o banco escolhido em BANCO
 * (`npm run banco:popular`).
 *
 * Sem argumento usa `dados/projetos.exemplo.json`. Para importar outro arquivo:
 * `npm run banco:popular -- dados/projetos.json`. Aceita `{ "projetos": [...] }`
 * ou uma lista direta. Os `id` do arquivo são descartados: o banco gera os seus.
 *
 * Só importa se não houver nenhum projeto, então rodar duas vezes não duplica nada.
 */

const arquivo = path.resolve(
  ambiente.raizDoBackend,
  process.argv[2] ?? 'dados/projetos.exemplo.json',
)

let fonteDeDados

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

  fonteDeDados = await criarFonteDeDados()
  await fonteDeDados.conectar()

  const existentes = (await fonteDeDados.projetos.listar()).length
  if (existentes > 0) {
    console.log(`O ${fonteDeDados.nome} já tem ${existentes} projeto(s): nada foi importado.`)
  } else {
    // Um a um: cada projeto cria o seu cliente, se for novo.
    for (const projeto of projetos) await fonteDeDados.projetos.criar(projeto)
    console.log(
      `✔ ${projetos.length} projeto(s) importado(s) para o ${fonteDeDados.nome} ` +
        `de ${path.relative(process.cwd(), arquivo)}.`,
    )
  }
} catch (erro) {
  console.error(`✘ ${erro.message}`)
  process.exitCode = 1
} finally {
  await fonteDeDados?.desconectar()
}
