import path from 'node:path'
import express, { Router } from 'express'
import { ambiente } from '../config/ambiente.js'

const UM_ANO_EM_SEGUNDOS = 60 * 60 * 24 * 365

/**
 * Serve o front-end compilado (`frontend/dist`) e devolve `null` se ele não
 * existir.
 *
 * - Arquivos reais (JS, CSS, imagens) são servidos como estão. Os de `assets/`
 *   têm o hash do conteúdo no nome, então podem ficar em cache por um ano.
 * - Qualquer outro GET sem extensão (`/projetos`, `/projetos/4/excluir`...)
 *   recebe o `index.html`: quem decide a tela é o React Router, no navegador.
 *   Sem isso, atualizar a página (F5) em uma rota do front-end daria 404.
 */
export function frontendEstatico() {
  if (!ambiente.frontendDisponivel) return null

  const pasta = ambiente.pastaFrontend
  const pastaAssets = `${path.sep}assets${path.sep}`
  const roteador = Router()

  roteador.use(
    express.static(pasta, {
      // `/` não cai aqui: o `index.html` é entregue pelo fallback abaixo.
      index: false,
      setHeaders(resposta, arquivo) {
        resposta.setHeader(
          'Cache-Control',
          arquivo.includes(pastaAssets)
            ? `public, max-age=${UM_ANO_EM_SEGUNDOS}, immutable`
            : 'no-cache',
        )
      },
    }),
  )

  roteador.get('/{*caminho}', (requisicao, resposta, proximo) => {
    // Pediu um arquivo que não existe (ex.: /assets/antigo.js): é 404 de verdade,
    // não uma tela do front-end.
    if (path.extname(requisicao.path)) return proximo()

    // O index.html aponta para os arquivos com hash do build atual; se ficasse em
    // cache, o navegador pediria arquivos de uma versão que não existe mais.
    resposta.sendFile('index.html', {
      root: pasta,
      headers: { 'Cache-Control': 'no-cache' },
    })
  })

  return roteador
}
