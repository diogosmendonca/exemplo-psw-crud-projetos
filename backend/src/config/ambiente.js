import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Carrega as variáveis do arquivo `.env` (se existir) e exporta a configuração
// da aplicação. Variáveis já definidas no ambiente têm prioridade sobre o `.env`.
try {
  process.loadEnvFile()
} catch (erro) {
  if (erro.code !== 'ENOENT') throw erro
}

// Pasta `backend/`, independente de onde o comando foi executado.
const raizDoBackend = fileURLToPath(new URL('../../', import.meta.url))

export const ambiente = {
  raizDoBackend,
  porta: Number(process.env.PORT ?? 3001),
  // Endereço do front-end autorizado a chamar a API (CORS).
  origemPermitida: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  // Arquivo JSON onde os projetos são gravados. Caminho relativo é contado a
  // partir da pasta `backend/`.
  arquivoDados: path.resolve(
    raizDoBackend,
    process.env.ARQUIVO_DADOS ?? 'dados/projetos.json',
  ),
}
