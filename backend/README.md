# Back-end — Gerenciador de Projetos

API REST do Gerenciador de Projetos, feita com Node.js e
[Express](https://expressjs.com/) 5.

> **Situação:** o CRUD de `/projetos` está completo (listar, buscar, criar, alterar
> e excluir), mas os dados ficam só em memória: a persistência ainda não existe.
> Veja [Rotas](#rotas).

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

## Rotas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/projetos` | Lista os projetos. Responde `200` com um array JSON. |
| `GET` | `/projetos/:id` | Devolve os dados de um projeto. Responde `200` com o projeto, ou `404` se não existir. |
| `POST` | `/projetos` | Cria um projeto a partir do JSON do corpo. Responde `201` com o projeto criado e o cabeçalho `Location`. |
| `PUT` | `/projetos/:id` | Substitui os dados do projeto pelo JSON do corpo. Responde `200` com o projeto alterado. |
| `DELETE` | `/projetos/:id` | Exclui o projeto. Responde `204`, sem corpo. |

### GET /projetos

```bash
curl http://localhost:3001/projetos
```

```json
[
  {
    "id": 1,
    "nome": "Portal do Aluno",
    "status": "ativo",
    "descricao": "Portal web para consulta de notas, faltas e horários.",
    "tecnologias": ["React", "Vite", "Bootstrap"],
    "url": "https://exemplo.com/portal-do-aluno"
  }
]
```

### GET /projetos/:id

```bash
curl http://localhost:3001/projetos/2
```

```json
{
  "id": 2,
  "nome": "API de Biblioteca",
  "status": "ativo",
  "descricao": "Serviço REST para controle de acervo e empréstimos.",
  "tecnologias": ["Node.js", "Express", "PostgreSQL"],
  "url": ""
}
```

Se não existir projeto com esse `id` (inclusive id não numérico), a resposta é
`404` com `{ "mensagem": "Projeto não encontrado." }`.

### POST /projetos

Corpo da requisição (JSON):

| Campo | Obrigatório | Regra |
| --- | --- | --- |
| `nome` | Sim | Texto não vazio. |
| `status` | Sim | `"ativo"` ou `"inativo"`. |
| `descricao` | Não | Texto. Padrão: `""`. |
| `tecnologias` | Não | Lista de textos. Padrão: `[]`. |
| `url` | Não | URL válida ou vazia. Padrão: `""`. |

O `id` é gerado pela API, sempre maior que todos os anteriores. Um `id` enviado no corpo e
campos desconhecidos são ignorados.

```bash
curl -i -X POST http://localhost:3001/projetos \
  -H "Content-Type: application/json" \
  -d '{"nome": "Novo App", "status": "ativo", "tecnologias": ["Node.js"]}'
```

```json
{
  "id": 4,
  "nome": "Novo App",
  "status": "ativo",
  "descricao": "",
  "tecnologias": ["Node.js"],
  "url": ""
}
```

Se algum campo for inválido, a resposta é `400` com todas as mensagens:

```json
{
  "mensagem": "Projeto inválido.",
  "erros": ["Informe o nome do projeto.", "Informe uma URL válida."]
}
```

### PUT /projetos/:id

Substitui **todos** os dados do projeto: o corpo segue as mesmas regras do
`POST` e os campos opcionais omitidos voltam ao padrão (`""` ou `[]`). O `id`
vem da URL e não muda; um `id` no corpo é ignorado.

```bash
curl -i -X PUT http://localhost:3001/projetos/2 \
  -H "Content-Type: application/json" \
  -d '{"nome": "API de Biblioteca v2", "status": "inativo"}'
```

| Resposta | Quando |
| --- | --- |
| `200` | Projeto alterado. O corpo é o projeto com os novos dados. |
| `404` | Não existe projeto com esse `id` (inclusive id não numérico): `{ "mensagem": "Projeto não encontrado." }`. |
| `400` | Corpo inválido, no mesmo formato de erros do `POST`. |

O `404` tem prioridade sobre o `400`: com um id inexistente, o corpo nem é validado.

### DELETE /projetos/:id

```bash
curl -i -X DELETE http://localhost:3001/projetos/2
```

| Resposta | Quando |
| --- | --- |
| `204` | Projeto excluído. A resposta não tem corpo. |
| `404` | Não existe projeto com esse `id` (inclusive id não numérico): `{ "mensagem": "Projeto não encontrado." }`. Excluir duas vezes o mesmo projeto, portanto, devolve `404` na segunda. |

O id de um projeto excluído **não é reaproveitado**: os ids novos sempre
continuam crescendo (função `proximoId` em `src/dados/projetos.js`), para que um
link antigo nunca aponte para outro projeto.

### Armazenamento

Os projetos ficam em uma variável em `src/dados/projetos.js`. O `POST`, o `PUT` e o
`DELETE` gravam nessa mesma variável, que as rotas de leitura também usam. Isso é provisório:
ao reiniciar a API, os dados voltam ao conteúdo desse arquivo.

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
│   ├── dados/
│   │   └── projetos.js            # Projetos em memória (provisório)
│   ├── middlewares/
│   │   ├── naoEncontrado.js       # 404 em JSON
│   │   └── tratadorDeErros.js     # Erros em JSON (400 para JSON inválido, 500 genérico)
│   ├── rotas/
│   │   └── projetos.js            # Rotas de /projetos
│   ├── validacoes/
│   │   └── projeto.js             # Validação do corpo de um projeto
│   ├── app.js                     # Monta o Express (middlewares e rotas)
│   └── servidor.js                # Sobe o servidor na porta configurada
├── .env.example
└── package.json
```

- `app.js` só **monta** a aplicação e `servidor.js` só **sobe** o servidor. Essa
  separação permite testar a API sem abrir uma porta.
- Cada recurso tem seu arquivo em `rotas/`, registrado em `app.js` antes de `naoEncontrado`.

## Formato de erro

Toda resposta de erro é JSON com uma mensagem em português:

```json
{ "mensagem": "Rota não encontrada: GET /projetos" }
```

## Licença

Distribuído sob a licença MIT. Veja o arquivo [`LICENSE`](../LICENSE) na raiz do repositório.
