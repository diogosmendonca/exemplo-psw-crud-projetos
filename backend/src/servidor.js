import { criarApp } from './app.js'
import { conectarMongo, desconectarMongo } from './banco/conexao.js'
import { ambiente } from './config/ambiente.js'
import { iniciarRepositorio } from './repositorio/projetos.js'

try {
  // Os dados precisam estar carregados antes de a API aceitar requisições.
  await iniciarRepositorio()
  await conectarMongo()
} catch (erro) {
  // Mensagem curta em vez de um stack trace: o problema é de configuração.
  console.error(erro.message)
  process.exit(1)
}

const app = criarApp()

app.listen(ambiente.porta, () => {
  console.log(`Modo: ${ambiente.producao ? 'produção' : 'desenvolvimento'}`)
  console.log(`API em http://localhost:${ambiente.porta}/api/projetos`)
  console.log(`Dados gravados em ${ambiente.arquivoDados}`)
  console.log('MongoDB conectado.')

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
    await desconectarMongo()
    process.exit(0)
  })
}
