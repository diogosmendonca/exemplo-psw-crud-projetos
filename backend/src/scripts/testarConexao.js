// Testa a conexão com o banco escolhido em BANCO (no .env): conecta, mostra a
// versão do servidor e desconecta. Uso: `npm run banco:testar`. Sai com código
// 1 se algo falhar.
import { criarFonteDeDados } from '../dao/index.js'

let fonteDeDados

try {
  fonteDeDados = await criarFonteDeDados()
  await fonteDeDados.conectar()

  console.log(`✔ Conectado ao ${fonteDeDados.nome} ${await fonteDeDados.versao()}`)
  console.log(`  Endereço: ${fonteDeDados.endereco}`)
} catch (erro) {
  console.error(`✘ ${erro.message}`)
  process.exitCode = 1
} finally {
  await fonteDeDados?.desconectar()
}
