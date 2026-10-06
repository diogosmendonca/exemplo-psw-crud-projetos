/**
 * Último middleware da aplicação: transforma qualquer erro em resposta JSON.
 * O Express identifica um tratador de erros pelos 4 parâmetros, então o
 * `proximo` precisa existir mesmo sem ser usado.
 */
// eslint-disable-next-line no-unused-vars
export function tratadorDeErros(erro, requisicao, resposta, proximo) {
  const status = erro.status ?? erro.statusCode ?? 500

  if (status >= 500) console.error(erro)

  // JSON inválido no corpo da requisição é erro do cliente (400), não do servidor.
  const mensagem =
    erro.type === 'entity.parse.failed'
      ? 'O corpo da requisição não é um JSON válido.'
      : status >= 500
        ? 'Erro interno do servidor.'
        : erro.message

  resposta.status(status).json({ mensagem })
}
