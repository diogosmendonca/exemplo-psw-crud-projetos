# Back-end — Gerenciador de Projetos

API REST do Gerenciador de Projetos, feita com Node.js e
[Express](https://expressjs.com/) 5.

> **Situação:** configuração inicial. O servidor sobe e já aplica CORS, leitura
> de JSON e tratamento de erros, mas **ainda não há rotas**: toda requisição
> recebe `404`. As rotas de `/projetos` serão a próxima etapa.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20.12 ou superior (recomendado 22.12+, igual ao front-end).

## Instalação e execução

Dentro da pasta `backend`:

```bash
npm install
cp .env.example .env   # opcional: sem o arquivo valem os padrões
npm run dev
```

A API fica em <http://localhost:3001>.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia a API e reinicia sozinha quando um arquivo muda. |
| `npm start` | Inicia a API (uso em produção). |
| `npm run lint` | Executa o oxlint. |

## Configuração

Variáveis lidas do ambiente ou do arquivo `.env` (modelo em `.env.example`):

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3001` | Porta da API. Não é `3000` para não colidir com o json-server do front-end enquanto os dois coexistirem. |
| `CORS_ORIGIN` | `http://localhost:5173` | Endereço do front-end autorizado a chamar a API. |

Variáveis já definidas no ambiente têm prioridade sobre o `.env`.

## Estrutura

```text
backend/
├── src/
│   ├── config/
│   │   └── ambiente.js            # Lê o .env e exporta a configuração
│   ├── middlewares/
│   │   ├── naoEncontrado.js       # 404 em JSON
│   │   └── tratadorDeErros.js     # Erros em JSON (400 para JSON inválido, 500 genérico)
│   ├── app.js                     # Monta o Express (middlewares e, depois, as rotas)
│   └── servidor.js                # Sobe o servidor na porta configurada
├── .env.example
└── package.json
```

- `app.js` só **monta** a aplicação e `servidor.js` só **sobe** o servidor. Essa
  separação permite testar a API sem abrir uma porta.
- Ao criar as rotas, registre-as em `app.js`, antes de `naoEncontrado`.

## Formato de erro

Toda resposta de erro é JSON com uma mensagem em português:

```json
{ "mensagem": "Rota não encontrada: GET /projetos" }
```

## Licença

Distribuído sob a licença MIT. Veja o arquivo [`LICENSE`](../LICENSE) na raiz do repositório.
