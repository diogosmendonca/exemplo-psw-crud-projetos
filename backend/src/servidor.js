import { criarApp } from './app.js'
import { ambiente } from './config/ambiente.js'

const app = criarApp()

app.listen(ambiente.porta, () => {
  console.log(`API em execução em http://localhost:${ambiente.porta}`)
})
