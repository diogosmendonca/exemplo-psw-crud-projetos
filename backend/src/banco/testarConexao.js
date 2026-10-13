// Testa a conexão com o MongoDB: conecta, faz um ping, mostra a versão e
// desconecta. Uso: `npm run mongo:testar`. Sai com código 1 se algo falhar.
import { conectarMongo, desconectarMongo } from './conexao.js'

try {
  const conexao = await conectarMongo()
  const admin = conexao.db.admin()

  const { ok } = await admin.ping()
  const { version } = await admin.serverInfo()

  console.log(`✔ Conectado ao MongoDB ${version} em ${conexao.host}:${conexao.port}`)
  console.log(`  Banco: ${conexao.name} | ping: ${ok === 1 ? 'ok' : 'falhou'}`)

  if (ok !== 1) process.exitCode = 1
} catch (erro) {
  console.error(`✘ ${erro.message}`)
  process.exitCode = 1
} finally {
  await desconectarMongo()
}
