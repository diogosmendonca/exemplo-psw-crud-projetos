// Carrega as variáveis do arquivo `.env` (se existir) e exporta a configuração
// da aplicação. Variáveis já definidas no ambiente têm prioridade sobre o `.env`.
try {
  process.loadEnvFile()
} catch (erro) {
  if (erro.code !== 'ENOENT') throw erro
}

export const ambiente = {
  porta: Number(process.env.PORT ?? 3001),
  // Endereço do front-end autorizado a chamar a API (CORS).
  origemPermitida: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
}
