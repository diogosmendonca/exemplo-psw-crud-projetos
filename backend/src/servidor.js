import { criarApp } from './app.js'
import { ambiente } from './config/ambiente.js'
import { iniciarRepositorio } from './repositorio/projetos.js'

// Os dados precisam estar carregados antes de a API aceitar requisições.
await iniciarRepositorio()

const app = criarApp()

app.listen(ambiente.porta, () => {
  console.log(`Modo: ${ambiente.producao ? 'produção' : 'desenvolvimento'}`)
  console.log(`API em http://localhost:${ambiente.porta}/api/projetos`)
  console.log(`Dados gravados em ${ambiente.arquivoDados}`)

  if (ambiente.frontendDisponivel) {
    console.log(`Aplicação em http://localhost:${ambiente.porta} (arquivos de ${ambiente.pastaFrontend})`)
  } else {
    console.log(
      `Front-end compilado não encontrado em ${ambiente.pastaFrontend}: só a API está disponível.`,
    )
  }
})
