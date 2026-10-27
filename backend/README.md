# Back-end — Gerenciador de Projetos

API REST do Gerenciador de Projetos, feita com Node.js e
[Express](https://expressjs.com/) 5.

> **Situação:** o CRUD de `/api/projetos` está completo (listar, buscar, criar, alterar
> e excluir) e os dados são gravados no **MongoDB ou no PostgreSQL**, à escolha na
> configuração. Veja [Rotas](#rotas) e [Bancos de dados](#bancos-de-dados). Em produção também serve o front-end
> compilado (veja [Servindo o front-end compilado](#servindo-o-front-end-compilado-produção)).

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20.12 ou superior (recomendado 22.12+, igual ao front-end).

- Um banco de dados: [MongoDB](https://www.mongodb.com/) (padrão) ou
  [PostgreSQL](https://www.postgresql.org/). A API **não sobe sem ele**. O jeito mais
  simples é um container Docker (veja [Bancos de dados](#bancos-de-dados)).

## Instalação e execução

Dentro da pasta `backend`:

```bash
npm install            # instala o monorepo inteiro (veja o README da raiz)
cp .env.example .env   # opcional: sem o arquivo valem os padrões
npm run dev
```

A API fica em <http://localhost:3001/api/projetos>. Todas as rotas ficam sob o
prefixo `/api` (veja [Rotas](#rotas)).

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia a API e reinicia sozinha quando um arquivo muda. |
| `npm start` | Inicia a API (uso em produção). |
| `npm run banco:popular` | Importa projetos de um JSON para o banco escolhido (padrão: os exemplos). Só importa se não houver projetos. |
| `npm run banco:testar` | Testa a conexão com o banco escolhido (conecta e mostra a versão). |
| `npm run prisma:migrar` | Cria ou atualiza as tabelas do PostgreSQL (aplica as migrações pendentes). |
| `npm run prisma:nova-migracao -- --name nome` | Cria uma migração a partir das mudanças em `prisma/schema.prisma` (desenvolvimento). |
| `npm run prisma:gerar` | Gera o cliente do Prisma. Roda sozinho no `npm install`. |
| `npm run lint` | Executa o oxlint. |

## Rotas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/projetos` | Lista os projetos. Responde `200` com um array JSON. |
| `GET` | `/api/projetos/:id` | Devolve os dados de um projeto. Responde `200` com o projeto, ou `404` se não existir. |
| `POST` | `/api/projetos` | Cria um projeto a partir do JSON do corpo. Responde `201` com o projeto criado e o cabeçalho `Location`. |
| `PUT` | `/api/projetos/:id` | Substitui os dados do projeto pelo JSON do corpo. Responde `200` com o projeto alterado. |
| `DELETE` | `/api/projetos/:id` | Exclui o projeto. Responde `204`, sem corpo. |
| `GET` | `/api/clientes` | Lista os clientes já cadastrados, em ordem alfabética. Veja [Clientes](#clientes). |
| `POST` | `/api/usuarios` | Cadastra um usuário. Responde `201` sem a senha, `400` se os dados forem inválidos e `409` se o e-mail ou o nome de usuário já existir. Veja [Usuários](#usuários). |

### GET /api/projetos

```bash
curl http://localhost:3001/api/projetos
```

Os ids dos exemplos são do MongoDB. No PostgreSQL eles são números sequenciais, mas
também chegam como texto (`"id": "1"`), então o front-end não muda.

```json
[
  {
    "id": "6aceb46b5086adf91b732126",
    "nome": "Portal do Aluno",
    "status": "ativo",
    "cliente": { "id": "6aceb46b5086adf91b73212a", "nome": "CEFET/RJ" },
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
| `cliente` | Não | `{ "nome": "Acme" }` ou `null`. Até 100 caracteres. Se o cliente ainda não existe, é criado. Padrão: `null`. Veja [Clientes](#clientes). |
| `descricao` | Não | Texto. Padrão: `""`. |
| `tecnologias` | Não | Lista de textos. Padrão: `[]`. |
| `url` | Não | URL válida ou vazia. Padrão: `""`. |

O `id` é gerado pelo banco. Um `id` enviado no corpo e
campos desconhecidos são ignorados.

```bash
curl -i -X POST http://localhost:3001/api/projetos \
  -H "Content-Type: application/json" \
  -d '{"nome": "Novo App", "status": "ativo", "tecnologias": ["Node.js"]}'
```

```json
{
  "id": "6aceb46b5086adf91b732128",
  "nome": "Novo App",
  "status": "ativo",
  "cliente": null,
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

A validação usa o `schemaProjeto` (zod) do pacote
[`@gerenciador-de-projetos/compartilhado`](../compartilhado/src/projeto.js), o
**mesmo schema que o formulário do front-end usa**. Mudar uma regra lá vale para os
dois lados.

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

O id de um projeto excluído **não é reaproveitado** (nem no MongoDB, nem na sequência
do PostgreSQL), então um link antigo nunca aponta para outro projeto.

## Usuários

O cadastro fica em **Cadastrar usuário** (`/usuarios/novo`). Ainda não há listagem
nem controle de acesso por perfil, e o projeto ainda não é ligado a um usuário.

A entrada é a tela **Entrar** (`/entrar`). O `POST /api/sessao` manda o nome de
usuário e a senha **uma vez**; a estratégia local do Passport confere o hash com
o bcrypt e o `express-session` grava um cookie `sessao` (só com o id da sessão,
`httpOnly`). As requisições seguintes mandam o cookie, não a senha. Sem sessão,
a API responde `401` e a aplicação volta para `/entrar`. `DELETE /api/sessao` sai.

```bash
curl -c cookies.txt -X POST http://localhost:3001/api/sessao \
  -H "Content-Type: application/json" \
  -d '{"nomeUsuario":"ana","senha":"segredo123"}'
curl -b cookies.txt http://localhost:3001/api/projetos
```

| Campo | Regra |
| --- | --- |
| `nome` | Obrigatório. Até 100 caracteres. |
| `email` | Obrigatório e único. Gravado em minúsculas. |
| `nomeUsuario` | Obrigatório, único e sem espaços. De 3 a 50 caracteres. `Ana` e `ana` são o mesmo usuário. |
| `senha` | De 8 a 72 caracteres. Não volta na resposta. |
| `perfil` | `administrador` (Administrador) ou `gerente` (Gerente de Projetos). |

A rota valida o corpo com o `schemaUsuario` do pacote compartilhado (o mesmo do
formulário) e entrega o cadastro à estratégia `cadastro` do Passport. O Passport não
gera o hash: a estratégia usa o bcrypt e o DAO grava só o resultado. A resposta é
`{ id, nome, email, nomeUsuario, perfil }`.

```bash
curl -i -X POST http://localhost:3001/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana","email":"ana@exemplo.com","nomeUsuario":"ana","senha":"segredo123","perfil":"gerente"}'
```

## Clientes

Cada projeto tem **no máximo um cliente**, e um cliente pode ter **muitos projetos**.
O cliente não tem tela nem cadastro próprio: ele nasce quando um projeto é salvo
com um nome novo.

- **No corpo do projeto** (`POST` e `PUT`) o cliente vai como `{ "nome": "Acme" }`. Se
  já existe um cliente com esse nome, o projeto passa a usá-lo; se não, ele é criado.
  A comparação **ignora maiúsculas e minúsculas** (`acme` e `ACME` são o cliente
  `Acme`, que vale com a grafia da primeira vez) e os espaços nas pontas. Um `id`
  dentro de `cliente` é ignorado. `"cliente": null` (ou omitido) deixa o projeto sem cliente.
- **Nas respostas** o cliente vem como `{ "id": "...", "nome": "..." }`, ou `null` para
  projetos sem cliente (como os criados antes desta funcionalidade).
- **`GET /api/clientes`** devolve a lista que preenche o select de cliente do formulário:

  ```json
  [
    { "id": "6aceb46b5086adf91b73212a", "nome": "CEFET/RJ" },
    { "id": "6aceb46b5086adf91b73212b", "nome": "Prefeitura Municipal" }
  ]
  ```

- Um cliente que ficou sem projetos **continua cadastrado** (continua sendo sugerido).
  Não há rota para excluí-lo ou renomeá-lo.

## Bancos de dados

A API grava os dados no **MongoDB** (com o [Mongoose](https://mongoosejs.com/)) ou no
**PostgreSQL** (com o [Prisma](https://www.prisma.io/)). A escolha é feita no `.env`,
e vale do início ao fim da execução:

```bash
BANCO=postgres    # ou mongodb (o padrão)
POSTGRES_URL=postgresql://psw:psw@localhost:5432/gerenciador_projetos
MONGODB_URI=mongodb://localhost:27017/gerenciador-projetos
```

Só a string de conexão do banco escolhido é usada. O log de início mostra qual está
em uso (sem a senha): `Banco: PostgreSQL em postgresql://***@localhost:5432/gerenciador_projetos`.
Os dois bancos não se sincronizam: cada um tem os seus projetos.

### Padrão DAO

As rotas não sabem em que banco estão os dados. Elas recebem dois objetos, um
**DAO** (*Data Access Object*) de projetos e um de clientes, e só chamam os métodos
do contrato:

| Contrato | Métodos |
| --- | --- |
| `ProjetoDAO` (`src/dao/ProjetoDAO.js`) | `listar()`, `buscarPorId(id)`, `criar(dados)`, `alterar(id, dados)`, `excluir(id)` |
| `ClienteDAO` (`src/dao/ClienteDAO.js`) | `listar()`, `obterOuCriar(nome)` |

Cada banco tem uma classe que estende o contrato: `ProjetoDAOMongo` e
`ClienteDAOMongo` em `src/dao/mongo/`, `ProjetoDAOPostgres` e `ClienteDAOPostgres` em
`src/dao/postgres/`. Todas devolvem os dados **no formato da API** (`id` em texto,
`cliente` como `{ id, nome }` ou `null`), então a resposta é a mesma com qualquer banco.

Quem escolhe a implementação é a fábrica `criarFonteDeDados()` (`src/dao/index.js`),
chamada uma vez pelo `servidor.js`:

```js
const fonteDeDados = await criarFonteDeDados() // lê BANCO do .env
await fonteDeDados.conectar()
const app = criarApp(fonteDeDados)             // { projetos, clientes, ... }
```

Ela carrega só o módulo do banco escolhido (rodando com MongoDB, o Prisma nem é
carregado) e recusa um `BANCO` desconhecido:
`BANCO inválido: "oracle". Use um destes valores: mongodb, postgres.`

Para acrescentar outro banco: criar uma pasta em `src/dao/` com as duas classes e um
`index.js` que exporta `criarFonteDeDados`, e registrá-la em `BANCOS`, no
`src/dao/index.js`. Rotas, validação e front-end não mudam.

### MongoDB

```bash
docker run -d --name mongodb-psw \
  -p 127.0.0.1:27017:27017 \
  -v mongodb-psw-dados:/data/db \
  mongo:8
```

Publicar a porta em `127.0.0.1` mantém o banco acessível só pela sua máquina. Esse
container não tem usuário e senha: serve para desenvolvimento, não para servidor.
Depois de reiniciar o computador, use `docker start mongodb-psw`.

As coleções são criadas sozinhas. O projeto fica em `projetos` e o cliente em
`cliente` (modelos em `src/dao/mongo/modelos/`). O projeto guarda o `_id` do cliente
(`ref: 'Cliente'`) e o DAO usa `populate('cliente')` para devolver `{ id, nome }`. O
`nome` do cliente tem um **índice único que ignora maiúsculas**, criado ao conectar.

**`id` da API × `_id` do MongoDB.** A API fala em `id` (texto); o banco guarda `_id`
(`ObjectId`). A conversão fica no DAO: na leitura, `_id` vira `id` (texto de 24
caracteres hexadecimais); um id da URL fora desse formato é tratado como projeto
inexistente (404), em vez de virar `CastError` (erro 500).

### PostgreSQL

```bash
docker run -d --name postgres-psw \
  -p 127.0.0.1:5432:5432 \
  -e POSTGRES_USER=psw -e POSTGRES_PASSWORD=psw -e POSTGRES_DB=gerenciador_projetos \
  -v postgres-psw-dados:/var/lib/postgresql \
  postgres:18
```

Esses usuário, senha e banco são os do padrão de `POSTGRES_URL`. Como no MongoDB, a
porta só fica acessível pela sua máquina e, depois de reiniciar o computador, basta
`docker start postgres-psw`. Para abrir o terminal do banco:
`docker exec -it postgres-psw psql -U psw gerenciador_projetos`.

Ao contrário do MongoDB, o PostgreSQL precisa das **tabelas criadas antes do
primeiro uso**:

```bash
npm run prisma:migrar
```

Sem isso a API não sobe e avisa: `O PostgreSQL está acessível, mas as tabelas não
existem. Crie-as com "npm run prisma:migrar" (na pasta backend).`

**Schema e migrações.** As tabelas são descritas em `prisma/schema.prisma`:

| Tabela | Colunas |
| --- | --- |
| `projetos` | `id` (sequencial), `nome`, `status` (enum `status_projeto`: `ativo`/`inativo`), `descricao`, `tecnologias` (`text[]`), `url`, `cliente_id` (chave estrangeira, `ON DELETE SET NULL`) |
| `cliente` | `id` (sequencial), `nome`, `nome_chave` (nome em minúsculas, **único**) |

O SQL que cria essas tabelas fica em `prisma/migrations/`, gerado pelo Prisma e
versionado no Git. Para mudar o schema: edite `prisma/schema.prisma` e rode
`npm run prisma:nova-migracao -- --name descricao-da-mudanca`, que cria a migração,
aplica no seu banco e regenera o cliente. Em outro ambiente, `npm run prisma:migrar`
aplica as migrações que faltam.

A conexão é configurada em `prisma.config.js` (lê a mesma `POSTGRES_URL`). A API usa o
`PrismaClient` com o adaptador `@prisma/adapter-pg`, que fala com o banco pelo driver
`pg` (`src/dao/postgres/conexao.js`).

**Clientes sem diferenciar maiúsculas.** O DAO grava o nome como digitado em `nome` e
em minúsculas em `nome_chave`. Buscar ou criar é um `upsert` pela chave: um único
`INSERT ... ON CONFLICT`, que não duplica o cliente mesmo com dois pedidos ao mesmo
tempo. A lista de clientes é ordenada por `nome_chave`.

**`id` da API × `id` do PostgreSQL.** No banco o `id` é um inteiro; na API, texto
(`"7"`). Um id da URL que não seja um inteiro positivo (`abc`, `0`, maior que
2147483647) é tratado como projeto inexistente (404).

### Dados iniciais

O banco começa **vazio**. Para carregar os três projetos de exemplo, com seus dois
clientes (`dados/projetos.exemplo.json`), no banco escolhido em `BANCO`:

```bash
npm run banco:popular
```

O comando só importa se não houver nenhum projeto, então rodá-lo de novo não duplica
nada. Para importar outro arquivo, passe o caminho. Serve também para trazer os
projetos de uma versão antiga, que gravava em `dados/projetos.json`:

```bash
npm run banco:popular -- dados/projetos.json
```

O arquivo pode ser `{ "projetos": [...] }` ou uma lista. Os `id` dele são descartados
(o banco gera os seus) e cada projeto passa pela mesma validação da API.

Para zerar o banco, apague os dados e rode o comando de novo:

```bash
# MongoDB
docker exec mongodb-psw mongosh gerenciador-projetos --eval "db.projetos.drop(); db.cliente.drop()"
# PostgreSQL
docker exec postgres-psw psql -U psw gerenciador_projetos -c "TRUNCATE projetos, cliente RESTART IDENTITY"

npm run banco:popular
```

### Testar a conexão

```bash
npm run banco:testar
```

```text
✔ Conectado ao PostgreSQL 18.6 (Debian 18.6-1.pgdg13+2)
  Endereço: postgresql://***@localhost:5432/gerenciador_projetos
```

Se falhar, mostra o motivo, sai com código `1` e não expõe a senha:

```text
✘ Não foi possível conectar ao PostgreSQL em postgresql://***@localhost:5432/gerenciador_projetos (ECONNREFUSED). Verifique se ele está em execução e se POSTGRES_URL está correta.
```

### Como a conexão se comporta

- **Ao iniciar:** a API espera o banco responder por até 5 segundos. Se não
  responder (ou, no PostgreSQL, se as tabelas não existirem), **não sobe** e explica
  o problema.
- **Banco cai com a API no ar:** as rotas de projetos respondem `500` enquanto ele
  estiver fora e voltam a funcionar sozinhas quando ele volta, sem reiniciar a API.
  No MongoDB o log avisa `MongoDB: desconectado inesperadamente.` e `MongoDB: reconectado.`
- **Ao encerrar** (`Ctrl+C` ou `SIGTERM`): a conexão é fechada antes de o processo sair.

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
| `BANCO` | `mongodb` | Banco onde os projetos são gravados: `mongodb` ou `postgres`. Veja [Bancos de dados](#bancos-de-dados). |
| `MONGODB_URI` | `mongodb://localhost:27017/gerenciador-projetos` | Endereço do MongoDB, no formato `mongodb://[usuário:senha@]host:porta/banco`. Usada com `BANCO=mongodb`. |
| `POSTGRES_URL` | `postgresql://psw:psw@localhost:5432/gerenciador_projetos` | Endereço do PostgreSQL, no formato `postgresql://usuário:senha@host:porta/banco`. Usada com `BANCO=postgres` e pelos comandos `prisma:*`. |
| `PASTA_FRONTEND` | `../frontend/dist` | Pasta com o front-end compilado. Caminho relativo conta a partir da pasta `backend`. |

Variáveis já definidas no ambiente têm prioridade sobre o `.env`.

## Estrutura

```text
backend/
├── prisma/
│   ├── migrations/                # SQL das tabelas do PostgreSQL (gerado pelo Prisma)
│   └── schema.prisma              # Tabelas do PostgreSQL
├── src/
│   ├── autenticacao/
│   │   ├── passport.js            # Estratégias local (login) e de cadastro do Passport
│   │   ├── senha.js               # Hash bcrypt da senha
│   │   └── sessao.js              # Cookie de sessão (express-session)
│   ├── config/
│   │   └── ambiente.js            # Lê o .env e exporta a configuração
│   ├── dao/
│   │   ├── mongo/
│   │   │   ├── modelos/           # Schemas e modelos do Mongoose (projeto, cliente e usuário)
│   │   │   ├── ClienteDAOMongo.js
│   │   │   ├── ProjetoDAOMongo.js
│   │   │   ├── UsuarioDAOMongo.js
│   │   │   ├── conexao.js         # Conexão com o MongoDB
│   │   │   └── index.js           # Monta os DAOs do MongoDB
│   │   ├── postgres/
│   │   │   ├── ClienteDAOPostgres.js
│   │   │   ├── ProjetoDAOPostgres.js
│   │   │   ├── UsuarioDAOPostgres.js
│   │   │   ├── conexao.js         # PrismaClient e conexão com o PostgreSQL
│   │   │   └── index.js           # Monta os DAOs do PostgreSQL
│   │   ├── ClienteDAO.js          # Contrato do DAO de clientes
│   │   ├── ProjetoDAO.js          # Contrato do DAO de projetos
│   │   ├── UsuarioDAO.js          # Contrato do DAO de usuários
│   │   ├── enderecoSemSenha.js    # Esconde a senha das strings de conexão nos logs
│   │   └── index.js               # Fábrica: escolhe o banco pela variável BANCO
│   ├── middlewares/
│   │   ├── frontendEstatico.js    # Serve frontend/dist e devolve index.html nas telas do React
│   │   ├── naoEncontrado.js       # 404 em JSON
│   │   └── tratadorDeErros.js     # Erros em JSON (400 para JSON inválido, 500 genérico)
│   ├── rotas/
│   │   ├── clientes.js            # Rota de /api/clientes
│   │   ├── projetos.js            # Rotas de /api/projetos
│   │   ├── sessao.js              # Entrar, ver a sessão e sair
│   │   └── usuarios.js            # Rota de cadastro em /api/usuarios
│   ├── scripts/
│   │   ├── popular.js             # Script do `npm run banco:popular`
│   │   └── testarConexao.js       # Script do `npm run banco:testar`
│   ├── validacoes/
│   │   ├── projeto.js             # Valida o corpo de um projeto com o schemaProjeto compartilhado
│   │   └── usuario.js             # Valida o corpo do cadastro com o schemaUsuario compartilhado
│   ├── app.js                     # Monta o Express (middlewares e rotas)
│   └── servidor.js                # Escolhe o banco, conecta e sobe o servidor
├── dados/
│   └── projetos.exemplo.json      # Dados iniciais, importados por `npm run banco:popular`
├── .env.example
├── prisma.config.js               # Configuração da CLI do Prisma (schema, migrações e conexão)
└── package.json
```

- As rotas não conhecem o banco: recebem os DAOs prontos (`criarRotasProjetos(projetos)`).
  Por isso o mesmo código de rotas atende o MongoDB e o PostgreSQL.
- `app.js` só **monta** a aplicação e `servidor.js` só **sobe** o servidor. Essa
  separação permite testar a API sem abrir uma porta (passando DAOs de teste a `criarApp`).
- Cada recurso tem seu arquivo em `rotas/`, registrado em `app.js` antes de `naoEncontrado`.

## Formato de erro

Toda resposta de erro é JSON com uma mensagem em português:

```json
{ "mensagem": "Rota não encontrada: GET /api/inexistente" }
```

## Licença

Distribuído sob a licença MIT. Veja o arquivo [`LICENSE`](../LICENSE) na raiz do repositório.
