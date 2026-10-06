/** Responde 404 em JSON para qualquer rota que nenhum handler tratou. */
export function naoEncontrado(requisicao, resposta) {
  resposta.status(404).json({
    mensagem: `Rota não encontrada: ${requisicao.method} ${requisicao.originalUrl}`,
  })
}
