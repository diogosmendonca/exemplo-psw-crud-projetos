const URL_BASE_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const URL_CLIENTES = `${URL_BASE_API}/clientes`

/**
 * Lista os clientes já cadastrados (`{ id, nome }`, em ordem alfabética).
 * Alimenta as opções do select "Cliente" do formulário. Não há criação aqui:
 * o cliente é criado pela API quando um projeto é salvo com um nome novo.
 *
 * A lista é só uma ajuda de preenchimento: se ela não puder ser carregada
 * (API fora do ar, ou o json-server, que não tem `/clientes`), o campo segue
 * funcionando, só que sem a lista (restam "Sem cliente" e "Novo cliente…").
 */
export async function listarClientes() {
  try {
    const resposta = await fetch(URL_CLIENTES)

    return resposta.ok ? await resposta.json() : []
  } catch {
    return []
  }
}
