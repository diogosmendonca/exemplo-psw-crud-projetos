import mongoose from 'mongoose'
import { ambiente } from '../config/ambiente.js'

// Se o MongoDB não responder neste tempo, a conexão falha (o padrão do driver é 30 s).
const TEMPO_LIMITE_MS = 5000

/** Endereço do MongoDB sem usuário e senha, seguro para aparecer em logs. */
function enderecoSemSenha() {
  return ambiente.mongoUri.replace(/\/\/[^@/]*@/, '//***@')
}

let ouvintesRegistrados = false
let encerrando = false

// Após conectar, o Mongoose reconecta sozinho se o banco cair. Estes avisos só
// tornam isso visível; sem o ouvinte de `error`, um erro depois da conexão
// inicial derrubaria o processo. Só são registrados depois da primeira conexão
// bem-sucedida: uma falha inicial já vira a exceção de `conectarMongo`, e os
// avisos só repetiriam o mesmo erro.
function registrarOuvintes() {
  if (ouvintesRegistrados) return
  ouvintesRegistrados = true

  mongoose.connection.on('error', (erro) => console.error(`MongoDB: erro na conexão: ${erro.message}`))
  mongoose.connection.on('disconnected', () => {
    if (!encerrando) console.warn('MongoDB: desconectado inesperadamente.')
  })
  mongoose.connection.on('reconnected', () => console.log('MongoDB: reconectado.'))
}

/**
 * Conecta ao MongoDB e devolve a conexão do Mongoose. Falha (com uma mensagem
 * clara, sem expor a senha) se o banco não responder em 5 segundos.
 */
export async function conectarMongo() {
  try {
    await mongoose.connect(ambiente.mongoUri, { serverSelectionTimeoutMS: TEMPO_LIMITE_MS })
  } catch (erro) {
    throw new Error(
      `Não foi possível conectar ao MongoDB em ${enderecoSemSenha()} (${erro.message}). ` +
        'Verifique se ele está em execução e se MONGODB_URI está correta.',
      { cause: erro },
    )
  }

  registrarOuvintes()

  // Cria os índices declarados nos schemas (ex.: nome único do cliente) antes do
  // primeiro uso. Só conhece os modelos já importados, que é o caso da API.
  await Promise.all(Object.values(mongoose.models).map((modelo) => modelo.init()))

  return mongoose.connection
}

/** Fecha a conexão. Pode ser chamada mesmo sem estar conectado. */
export async function desconectarMongo() {
  encerrando = true
  await mongoose.disconnect()
}
