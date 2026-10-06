import { criarApp } from './app.js'
import { ambiente } from './config/ambiente.js'
import { iniciarRepositorio } from './repositorio/projetos.js'

// Os dados precisam estar carregados antes de a API aceitar requisições.
await iniciarRepositorio()

const app = criarApp()

app.listen(ambiente.porta, () => {
  console.log(`API em execução em http://localhost:${ambiente.porta}`)
  console.log(`Dados gravados em ${ambiente.arquivoDados}`)
})
