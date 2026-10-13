# Back-end — Gerenciador de Projetos

API REST do Gerenciador de Projetos, feita com Node.js e
[Express](https://expressjs.com/) 5.

> **Situação:** o CRUD de `/api/projetos` está completo (listar, buscar, criar, alterar
> e excluir) e os dados são gravados no MongoDB. Veja [Rotas](#rotas) e
> [MongoDB](#mongodb). Em produção também serve o front-end
> compilado (veja [Servindo o front-end compilado](#servindo-o-front-end-compilado-produção)).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20.12 ou superior (recomendado 22.12+, igual ao front-end).

- [MongoDB](https://www.mongodb.com/) acessível pela `MONGODB_URI`. A API **não sobe
  sem ele**. O jeito mais simples é um container (veja [MongoDB](#mongodb)).

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
| `npm run mongo:popular` | Importa projetos de um JSON para o MongoDB (padrão: os exemplos). Só importa se a coleção estiver vazia. |
| `npm run mongo:testar` | Testa a conexão com o MongoDB (conecta, faz ping e mostra a versão). |
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
    "id": "6aceb46b5086adf91b732126",
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
curl http://localhost:3001/api/projetos/6aceb46b5086adf91b732127
```

```json
{
  "id": "6aceb46b5086adf91b732127",
  "nome": "API de Biblioteca",
  "status": "ativo",
  "descricao": "Serviço REST para controle de acervo e empréstimos.",
  "tecnologias": ["Node.js", "Express", "PostgreSQL"],
  "url": ""
}
```

Se não existir projeto com esse `id` (inclusive um id fora do formato), a resposta é
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

O `id` é gerado pelo MongoDB. Um `id` enviado no corpo e
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
curl -i -X PUT http://localhost:3001/api/projetos/6aceb46b5086adf91b732127 \
  -H "Content-Type: application/json" \
  -d '{"nome": "API de Biblioteca v2", "status": "inativo"}'
```

| Resposta | Quando |
| --- | --- |
| `200` | Projeto alterado. O corpo é o projeto com os novos dados. |
| `404` | Não existe projeto com esse `id` (inclusive um id fora do formato): `{ "mensagem": "Projeto não encontrado." }`. |
| `400` | Corpo inválido, no mesmo formato de erros do `POST`. |

O `404` tem prioridade sobre o `400`: com um id inexistente, o corpo nem é validado.

### DELETE /api/projetos/:id

```bash
curl -i -X DELETE http://localhost:3001/api/projetos/6aceb46b5086adf91b732127
```

| Resposta | Quando |
| --- | --- |
| `204` | Projeto excluído. A resposta não tem corpo. |
| `404` | Não existe projeto com esse `id` (inclusive um id fora do formato): `{ "mensagem": "Projeto não encontrado." }`. Excluir duas vezes o mesmo projeto, portanto, devolve `404` na segunda. |

O id de um projeto excluído **não é reaproveitado**: o MongoDB gera ids únicos, então
um link antigo nunca aponta para outro projeto.

## MongoDB

Os projetos são gravados no MongoDB, na coleção `projetos`, com o
[Mongoose](https://mongoosejs.com/):

- `src/banco/conexao.js` conecta ao banco ao iniciar a API;
- `src/modelos/projeto.js` define o schema (veja [Schema do projeto](#schema-do-projeto));
- `src/repositorio/projetos.js` faz as consultas. As rotas só falam com ele.

### Subir um MongoDB com Docker

```bash
docker run -d --name mongodb-psw \
  -p 127.0.0.1:27017:27017 \
  -v mongodb-psw-dados:/data/db \
  mongo:8
```

Publicar a porta em `127.0.0.1` mantém o banco acessível só pela sua máquina. Esse
container não tem usuário e senha: serve para desenvolvimento, não para servidor.
Depois de reiniciar o computador, use `docker start mongodb-psw`.

### Dados iniciais

O banco começa **vazio**. Para carregar os três projetos de exemplo
(`dados/projetos.exemplo.json`):

```bash
npm run mongo:popular
```

O comando só importa se a coleção estiver vazia, então rodá-lo de novo não duplica
nada. Para importar outro arquivo, passe o caminho. Serve também para trazer os
projetos de uma versão antiga, que gravava em `dados/projetos.json`:

```bash
npm run mongo:popular -- dados/projetos.json
```

O arquivo pode ser `{ "projetos": [...] }` ou uma lista. Os `id` dele são descartados
(o MongoDB gera os seus) e cada projeto passa pela mesma validação da API.

Para zerar o banco, apague a coleção e rode o comando de novo:

```bash
docker exec mongodb-psw mongosh gerenciador-projetos --eval "db.projetos.drop()"
npm run mongo:popular
```

### Testar a conexão

```bash
npm run mongo:testar
```

```text
✔ Conectado ao MongoDB 8.3.11 em localhost:27017
  Banco: gerenciador-projetos | ping: ok
```

Se falhar, mostra o motivo, sai com código `1` e não expõe a senha da `MONGODB_URI`:

```text
✘ Não foi possível conectar ao MongoDB em mongodb://localhost:27999/x (connect ECONNREFUSED ...). Verifique se ele está em execução e se MONGODB_URI está correta.
```

### Como a conexão se comporta

- **Ao iniciar:** a API espera o banco responder por até 5 segundos. Se não
  responder, **não sobe** e explica o problema.
- **Banco cai com a API no ar:** o log avisa `MongoDB: desconectado inesperadamente.`
  e as rotas de projetos respondem `500` (depois de até 5 segundos de espera) enquanto
  ele estiver fora. O Mongoose reconecta sozinho quando ele volta
  (`MongoDB: reconectado.`) e a API volta a funcionar sem reiniciar.
- **Ao encerrar** (`Ctrl+C` ou `SIGTERM`): a conexão é fechada antes de o processo sair.

### Schema do projeto

O modelo `Projeto` (`src/modelos/projeto.js`) usa a coleção `projetos` e tem os mesmos
campos da API: `nome` e `status` (`ativo` ou `inativo`) obrigatórios, e `descricao`,
`tecnologias` e `url` opcionais. Espaços nas pontas de `nome` e `url` são removidos.
É usado por `src/repositorio/projetos.js`.

**`id` da API × `_id` do MongoDB.** A API fala em `id` (texto); o banco guarda `_id`
(`ObjectId`). A conversão fica toda no modelo:

| Sentido | Como | Resultado |
| --- | --- | --- |
| Banco → API | `JSON.stringify(doc)` / `resposta.json(doc)` | `_id` vira `id` (texto de 24 caracteres hexadecimais), e o `__v` some |
| API → banco | `Projeto.paraDocumento({ id, ...dados })` | `id` vira `_id`; sem `id`, o MongoDB gera o `_id` |
| Id vindo da URL | `idValido(id)` antes do `findById` | id fora do formato dá 404, e não `CastError` (erro 500) |

```json
{ "id": "6aceb46b5086adf91b732126", "nome": "Portal do Aluno", "status": "ativo", "descricao": "", "tecnologias": ["React"], "url": "" }
```

O repositório trata um id fora do formato como projeto inexistente: `GET /api/projetos/1`
responde `404`, como qualquer id que não existe. Os ids numéricos da versão antiga
(1, 2, 3...) deixaram de valer: ao importar os dados, cada projeto ganha um id novo.

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
| `MONGODB_URI` | `mongodb://localhost:27017/gerenciador-projetos` | Endereço do MongoDB onde os projetos são gravados, no formato `mongodb://[usuário:senha@]host:porta/banco`. |
| `PASTA_FRONTEND` | `../frontend/dist` | Pasta com o front-end compilado. Caminho relativo conta a partir da pasta `backend`. |

Variáveis já definidas no ambiente têm prioridade sobre o `.env`.

## Estrutura

```text
backend/
├── src/
│   ├── banco/
│   │   ├── conexao.js             # Conexão com o MongoDB (Mongoose)
│   │   ├── popular.js             # Script do `npm run mongo:popular`
│   │   └── testarConexao.js       # Script do `npm run mongo:testar`
│   ├── config/
│   │   └── ambiente.js            # Lê o .env e exporta a configuração
│   ├── middlewares/
│   │   ├── frontendEstatico.js    # Serve frontend/dist e devolve index.html nas telas do React
│   │   ├── naoEncontrado.js       # 404 em JSON
│   │   └── tratadorDeErros.js     # Erros em JSON (400 para JSON inválido, 500 genérico)
│   ├── modelos/
│   │   └── projeto.js             # Schema e modelo do projeto (Mongoose)
│   ├── repositorio/
│   │   └── projetos.js            # Consultas dos projetos no MongoDB
│   ├── rotas/
│   │   └── projetos.js            # Rotas de /api/projetos
│   ├── validacoes/
│   │   └── projeto.js             # Validação do corpo de um projeto
│   ├── app.js                     # Monta o Express (middlewares e rotas)
│   └── servidor.js                # Sobe o servidor na porta configurada
├── dados/
│   └── projetos.exemplo.json      # Dados iniciais, importados por `npm run mongo:popular`
├── .env.example
└── package.json
```

- As rotas não conhecem o banco: falam só com o `repositorio/`. Foi por isso que trocar
  o arquivo JSON pelo MongoDB mexeu quase só nele.
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
