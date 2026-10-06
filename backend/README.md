# Back-end — Gerenciador de Projetos

API REST do Gerenciador de Projetos, feita com Node.js e
[Express](https://expressjs.com/) 5.

> **Situação:** o CRUD de `/api/projetos` está completo (listar, buscar, criar, alterar
> e excluir) e os dados são gravados em um arquivo JSON. Veja [Rotas](#rotas) e
> [Armazenamento](#armazenamento). Em produção também serve o front-end
> compilado (veja [Servindo o front-end compilado](#servindo-o-front-end-compilado-produção)).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20.12 ou superior (recomendado 22.12+, igual ao front-end).

## Instalação e execução

Dentro da pasta `backend`:

```bash
npm install
cp .env.example .env   # opcional: sem o arquivo valem os padrões
npm run dev
```

A API fica em <http://localhost:3001/api/projetos>. Todas as rotas ficam sob o
prefixo `/api` (veja [Rotas](#rotas)).

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia a API e reinicia sozinha quando um arquivo muda. |
| `npm start` | Inicia a API (uso em produção). |
| `npm run lint` | Executa o oxlint. |

## Rotas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/projetos` | Lista os projetos. Responde `200` com um array JSON. |
| `GET` | `/api/projetos/:id` | Devolve os dados de um projeto. Responde `200` com o projeto, ou `404` se não existir. |
| `POST` | `/api/projetos` | Cria um projeto a partir do JSON do corpo. Responde `201` com o projeto criado e o cabeçalho `Location`. |
| `PUT` | `/api/projetos/:id` | Substitui os dados do projeto pelo JSON do corpo. Responde `200` com o projeto alterado. |
| `DELETE` | `/api/projetos/:id` | Exclui o projeto. Responde `204`, sem corpo. |

### GET /api/projetos

```bash
curl http://localhost:3001/api/projetos
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

### GET /api/projetos/:id

```bash
curl http://localhost:3001/api/projetos/2
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

### POST /api/projetos

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
curl -i -X POST http://localhost:3001/api/projetos \
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

### PUT /api/projetos/:id

Substitui **todos** os dados do projeto: o corpo segue as mesmas regras do
`POST` e os campos opcionais omitidos voltam ao padrão (`""` ou `[]`). O `id`
vem da URL e não muda; um `id` no corpo é ignorado.

```bash
curl -i -X PUT http://localhost:3001/api/projetos/2 \
  -H "Content-Type: application/json" \
  -d '{"nome": "API de Biblioteca v2", "status": "inativo"}'
```

| Resposta | Quando |
| --- | --- |
| `200` | Projeto alterado. O corpo é o projeto com os novos dados. |
| `404` | Não existe projeto com esse `id` (inclusive id não numérico): `{ "mensagem": "Projeto não encontrado." }`. |
| `400` | Corpo inválido, no mesmo formato de erros do `POST`. |

O `404` tem prioridade sobre o `400`: com um id inexistente, o corpo nem é validado.

### DELETE /api/projetos/:id

```bash
curl -i -X DELETE http://localhost:3001/api/projetos/2
```

| Resposta | Quando |
| --- | --- |
| `204` | Projeto excluído. A resposta não tem corpo. |
| `404` | Não existe projeto com esse `id` (inclusive id não numérico): `{ "mensagem": "Projeto não encontrado." }`. Excluir duas vezes o mesmo projeto, portanto, devolve `404` na segunda. |

O id de um projeto excluído **não é reaproveitado**: os ids novos sempre
continuam crescendo (o último id usado é guardado junto com os projetos), para que um
link antigo nunca aponte para outro projeto.

## Armazenamento

Os projetos são gravados em um **arquivo JSON**: `dados/projetos.json`.

```json
{
  "ultimoId": 3,
  "projetos": [
    { "id": 1, "nome": "Portal do Aluno", "status": "ativo", "descricao": "", "tecnologias": [], "url": "" }
  ]
}
```

- **Primeira execução:** se `dados/projetos.json` não existe, a API o cria como
  uma cópia de `dados/projetos.exemplo.json` (três projetos de exemplo).
- **Git:** só o arquivo de exemplo é versionado. O `projetos.json` está no
  `.gitignore`, então usar a API não suja o repositório.
- **Voltar aos dados de exemplo:** pare a API e apague `dados/projetos.json`; ele
  será recriado na próxima execução.
- **`ultimoId`:** o último id já usado. Ele garante que o id de um projeto
  excluído nunca seja reaproveitado, nem depois de reiniciar a API.
- **Edição manual:** o arquivo é lido **uma vez, ao iniciar**. Para editá-lo à
  mão, pare a API antes. Se o `ultimoId` faltar, a API usa o maior id existente.
- **Arquivo inválido:** se o conteúdo não for um JSON no formato acima, a API não
  sobe e informa o problema, em vez de sobrescrever os dados.

Como funciona (`src/repositorio/projetos.js`):

- Cada alteração (`POST`, `PUT`, `DELETE`) é gravada no arquivo **antes** de passar
  a valer. Se a gravação falhar, a API responde `500` e nada muda.
- A gravação é atômica: escreve em um arquivo temporário e o renomeia, então o
  arquivo nunca fica pela metade, mesmo se a API cair no meio.
- As alterações são executadas uma de cada vez, para que requisições simultâneas
  não se sobrescrevam.

### Limites desta solução

Um arquivo JSON serve para um exemplo e para uso com **uma única instância** da
API. Ele reescreve o arquivo inteiro a cada alteração e não permite que dois
processos o usem ao mesmo tempo. Para mais que isso, o caminho natural é um banco
de dados; as rotas não precisariam mudar, só `src/repositorio/projetos.js`.

## Servindo o front-end compilado (produção)

Se a pasta `../frontend/dist` existir ao iniciar, a API também serve a aplicação
web, e o conjunto roda em **uma só porta e uma só origem** (sem CORS).

- `/api/...` continua sendo a API. Rota desconhecida sob `/api` devolve `404` em JSON.
- Arquivos de `frontend/dist` são servidos como estão (os de `assets/` com cache
  de um ano, pois têm hash no nome).
- Qualquer outro `GET` sem extensão (`/`, `/projetos`, `/projetos/4/excluir`)
  recebe o `index.html`, e o React Router decide a tela. Assim o F5 funciona.
- Se a pasta não existir, só a API fica no ar (o log avisa).

Passo a passo de implantação: [README da raiz](../README.md#implantação-em-produção).
O código está em `src/middlewares/frontendEstatico.js`.

## Configuração

Variáveis lidas do ambiente ou do arquivo `.env` (modelo em `.env.example`):

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3001` | Porta da API (e da aplicação, quando o front-end compilado é servido). Não é `3000` para não colidir com o json-server do front-end enquanto os dois coexistirem. |
| `NODE_ENV` | (vazio) | Use `production` ao implantar: desliga o CORS padrão e ativa o modo de produção do Express. |
| `CORS_ORIGIN` | `http://localhost:5173` em desenvolvimento; **nenhum** em produção | Endereço de outro site autorizado a chamar a API. Se definida, vale em qualquer modo. Em produção, com o front-end servido pela API, não é necessária. |
| `ARQUIVO_DADOS` | `dados/projetos.json` | Arquivo JSON onde os projetos são gravados. Caminho relativo conta a partir da pasta `backend`. |
| `PASTA_FRONTEND` | `../frontend/dist` | Pasta com o front-end compilado. Caminho relativo conta a partir da pasta `backend`. |

Variáveis já definidas no ambiente têm prioridade sobre o `.env`.

## Estrutura

```text
backend/
├── src/
│   ├── config/
│   │   └── ambiente.js            # Lê o .env e exporta a configuração
│   ├── middlewares/
│   │   ├── frontendEstatico.js    # Serve frontend/dist e devolve index.html nas telas do React
│   │   ├── naoEncontrado.js       # 404 em JSON
│   │   └── tratadorDeErros.js     # Erros em JSON (400 para JSON inválido, 500 genérico)
│   ├── repositorio/
│   │   └── projetos.js            # Leitura e gravação dos projetos no arquivo JSON
│   ├── rotas/
│   │   └── projetos.js            # Rotas de /api/projetos
│   ├── validacoes/
│   │   └── projeto.js             # Validação do corpo de um projeto
│   ├── app.js                     # Monta o Express (middlewares e rotas)
│   └── servidor.js                # Sobe o servidor na porta configurada
├── dados/
│   ├── projetos.exemplo.json      # Dados iniciais (versionado)
│   └── projetos.json              # Dados em uso (criado pela API; ignorado pelo git)
├── .env.example
└── package.json
```

- As rotas não conhecem o arquivo: falam só com o `repositorio/`. Trocar o JSON por
  um banco de dados mexe apenas nele.
- `app.js` só **monta** a aplicação e `servidor.js` só **sobe** o servidor. Essa
  separação permite testar a API sem abrir uma porta.
- Cada recurso tem seu arquivo em `rotas/`, registrado em `app.js` antes de `naoEncontrado`.

## Formato de erro

Toda resposta de erro é JSON com uma mensagem em português:

```json
{ "mensagem": "Rota não encontrada: GET /api/inexistente" }
```

## Licença

Distribuído sob a licença MIT. Veja o arquivo [`LICENSE`](../LICENSE) na raiz do repositório.
