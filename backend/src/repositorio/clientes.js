import { COLLATION_NOME, Cliente } from '../modelos/cliente.js'

/**
 * Acesso aos clientes no MongoDB. Clientes não têm tela própria: nascem quando
 * um projeto é salvo com um cliente novo (`obterOuCriarCliente`) e alimentam a
 * lista de sugestões do formulário (`listarClientes`).
 */

/** Lista os clientes em ordem alfabética (sem diferenciar maiúsculas). */
export function listarClientes() {
  return Cliente.find().sort({ nome: 1 }).collation(COLLATION_NOME)
}

/**
 * Devolve o cliente com esse nome, criando-o se ainda não existir. "acme" e
 * "ACME" são o mesmo cliente: vale o nome da primeira vez que foi cadastrado.
 */
export async function obterOuCriarCliente(nome) {
  const filtro = { nome }

  try {
    // Uma única operação (buscar ou inserir), para não criar duplicado quando
    // dois projetos com o mesmo cliente novo são salvos ao mesmo tempo.
    return await Cliente.findOneAndUpdate(
      filtro,
      { $setOnInsert: { nome } },
      { upsert: true, returnDocument: 'after', collation: COLLATION_NOME },
    )
  } catch (erro) {
    // 11000 (chave duplicada): outra requisição criou o mesmo cliente no meio
    // do caminho. Ele já existe, então basta buscá-lo.
    if (erro.code !== 11000) throw erro

    return Cliente.findOne(filtro).collation(COLLATION_NOME)
  }
}
