import { existsSync } from 'node:fs'
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

const producao = process.env.NODE_ENV === 'production'

// Pasta com o front-end compilado (`npm run build` em `frontend/`). Caminho
// relativo conta a partir da pasta `backend/`.
const pastaFrontend = path.resolve(
  raizDoBackend,
  process.env.PASTA_FRONTEND ?? '../frontend/dist',
)

export const ambiente = {
  raizDoBackend,
  producao,
  porta: Number(process.env.PORT ?? 3001),
  // Endereço do front-end autorizado a chamar a API (CORS). Em desenvolvimento
  // o front-end (Vite, porta 5173) roda em outra origem, então o padrão libera
  // essa origem. Em produção o front-end é servido pela própria API (mesma
  // origem), então não há CORS, a menos que `CORS_ORIGIN` seja definido.
  origemPermitida: process.env.CORS_ORIGIN ?? (producao ? null : 'http://localhost:5173'),
  // Banco onde os projetos são gravados: "mongodb" ou "postgres".
  banco: (process.env.BANCO ?? 'mongodb').trim().toLowerCase(),
  // Endereço do MongoDB (formato mongodb://[usuário:senha@]host:porta/banco).
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/gerenciador-projetos',
  // Endereço do PostgreSQL (formato postgresql://usuário:senha@host:porta/banco).
  postgresUrl:
    process.env.POSTGRES_URL ?? 'postgresql://psw:psw@localhost:5432/gerenciador_projetos',
  // Assina o JWT. Troque em produção (JWT_SECRET no .env).
  segredoDoJwt: process.env.JWT_SECRET ?? 'segredo-de-desenvolvimento',
  pastaFrontend,
  // Só serve o front-end se ele já foi compilado.
  frontendDisponivel: existsSync(path.join(pastaFrontend, 'index.html')),
}
