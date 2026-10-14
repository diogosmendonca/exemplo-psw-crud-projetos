import { criarApp } from './app.js'
import { ambiente } from './config/ambiente.js'
import { criarFonteDeDados } from './dao/index.js'

let fonteDeDados

try {
  // O banco é escolhido aqui, uma vez, pela variável BANCO do .env. E precisa
  // estar conectado antes de a API aceitar requisições.
  fonteDeDados = await criarFonteDeDados()
  await fonteDeDados.conectar()
} catch (erro) {
  // Mensagem curta em vez de um stack trace: o problema é de configuração.
  console.error(erro.message)
  process.exit(1)
}

const app = criarApp(fonteDeDados)

app.listen(ambiente.porta, () => {
  console.log(`Modo: ${ambiente.producao ? 'produção' : 'desenvolvimento'}`)
  console.log(`API em http://localhost:${ambiente.porta}/api/projetos`)
  console.log(`Banco: ${fonteDeDados.nome} em ${fonteDeDados.endereco}`)

  if (ambiente.frontendDisponivel) {
    console.log(`Aplicação em http://localhost:${ambiente.porta} (arquivos de ${ambiente.pastaFrontend})`)
  } else {
    console.log(
      `Front-end compilado não encontrado em ${ambiente.pastaFrontend}: só a API está disponível.`,
    )
  }
})

// Fecha a conexão com o banco ao encerrar (Ctrl+C ou parada pelo sistema).
for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.on(sinal, async () => {
    await fonteDeDados.desconectar()
    process.exit(0)
  })
}
