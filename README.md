# Gerenciador de Projetos

Exemplo de aplicação da disciplina de PSW no CEFET/RJ: CRUD de projetos com
front-end em React e back-end em Node.js com Express.

Os projetos vivem **neste mesmo repositório**, em pastas separadas, cada um com seu
próprio `package.json` e suas próprias dependências. Eles formam um
[monorepo com *npm workspaces*](#monorepo-npm-workspaces): uma única instalação, feita
na raiz, atende a todos.

| Pasta | O que é | Situação |
| --- | --- | --- |
| [`compartilhado/`](compartilhado) | Pacote `@gerenciador-de-projetos/compartilhado` | Schemas do zod do projeto, usados pelo front-end (formulário) e pelo back-end (API). |

| [`frontend/`](frontend) | Aplicação web (React, Vite, Bootstrap) | Pronto. Funciona com o back-end ou com a API simulada (json-server). |
| [`backend/`](backend) | API REST (Node.js, Express) | CRUD completo em `/api/projetos`, com dados gravados no MongoDB ou no PostgreSQL (padrão DAO, Prisma). Também serve o front-end compilado em produção. |

## Estrutura

```text
.
├── .cursor/rules/    # Regras para agentes de IA (Cursor)
├── backend/          # API (Node.js + Express)
├── compartilhado/    # Pacote com os schemas (zod) usados pelo front-end e pelo back-end
├── frontend/         # Aplicação web (React + Vite)
├── LICENSE
├── package.json      # Raiz do monorepo (workspaces e atalhos)
├── package-lock.json # Único lockfile, para os três pacotes
└── README.md
```

## Como executar

Pré-requisitos: [Node.js](https://nodejs.org/) 22.12 ou superior e, para o back-end, um
MongoDB ou um PostgreSQL, à escolha na variável `BANCO` de `backend/.env` (veja como
subir cada um com Docker no [README do back-end](backend/README.md#bancos-de-dados)).

```bash
git clone https://github.com/diogosmendonca/exemplo-psw-crud-projetos.git
cd exemplo-psw-crud-projetos
npm install              # instala front-end, back-end e compartilhado de uma vez
```

Cada pasta é executada separadamente:

- **Front-end** (com a API simulada): veja o [manual do front-end](frontend/README.md).
- **Back-end**: veja o [README do back-end](backend/README.md).

### Front-end com o back-end

Em dois terminais:

```bash
# Terminal 1 - API em http://localhost:3001/api/projetos
cd backend
npm run dev
```

```bash
# Terminal 2 - aplicação em http://localhost:5173
cd frontend
cp .env.example .env     # já aponta para o back-end (VITE_API_URL=http://localhost:3001/api)
npm run dev
```

O back-end grava os projetos no MongoDB (padrão) ou no PostgreSQL, que começam vazios.
Para carregar os três projetos de exemplo, rode uma vez `npm run banco:popular` na
pasta `backend`. Com o PostgreSQL, antes disso crie as tabelas com
`npm run prisma:migrar`. Veja os detalhes no
[README do back-end](backend/README.md#bancos-de-dados).

Da raiz também dá para usar os atalhos `npm run dev:backend`, `npm run dev:frontend` e
`npm run lint` (este roda o lint dos três pacotes).

## Implantação em produção

Em produção **um único processo** entrega tudo: o back-end serve a API (em
`/api`) e também os arquivos compilados do front-end. Isso traz duas vantagens:
só há um endereço para publicar e **não é preciso configurar CORS**, porque a
aplicação e a API ficam na mesma origem.

### Passo a passo

1. **Instale e compile o front-end** (gera `frontend/dist`). Na raiz do repositório:

   ```bash
   npm ci
   npm run build
   npm prune --omit=dev     # opcional: remove o que só serve para desenvolver e compilar
   ```

   O build lê `frontend/.env.production`, que já define `VITE_API_URL=/api`, então
   o código compilado chama a API na própria origem. Não é preciso configurar nada.

2. **Inicie o back-end** em modo de produção (ainda na raiz):

   ```bash
   NODE_ENV=production npm start
   ```

   No Windows (PowerShell): `$env:NODE_ENV="production"; npm start`. Em qualquer
   sistema, também vale colocar `NODE_ENV=production` em `backend/.env`.

3. **Prepare o banco** escolhido em `BANCO` (só na primeira vez). Com o PostgreSQL,
   crie ou atualize as tabelas (repita a cada nova versão que traga migrações):

   ```bash
   npm run prisma:migrar -w backend
   ```

   Depois, se quiser, carregue os dados de exemplo (o banco começa vazio):

   ```bash
   npm run banco:popular -w backend
   ```

4. **Acesse** <http://localhost:3001>. A porta muda com a variável `PORT`.

Ao iniciar, o back-end informa o que está servindo:

```text
Modo: produção
API em http://localhost:3001/api/projetos
Banco: MongoDB em mongodb://localhost:27017/gerenciador-projetos
Aplicação em http://localhost:3001 (arquivos de .../frontend/dist)
```

Se aparecer "Front-end compilado não encontrado", o `npm run build` do passo 1
não foi feito (ou `PASTA_FRONTEND` aponta para o lugar errado): só a API fica no ar.

### Como as URLs são atendidas

| Requisição | Resposta |
| --- | --- |
| `/api/...` | API (JSON). Rota desconhecida sob `/api` devolve `404` em JSON. |
| Arquivo que existe em `frontend/dist` (`/assets/...`, `/favicon.svg`) | O arquivo. Os de `assets/` têm hash no nome e ficam em cache por um ano. |
| Qualquer outro `GET` sem extensão (`/`, `/projetos`, `/projetos/4/excluir`) | `index.html`. A tela é escolhida pelo React Router, no navegador. Por isso atualizar a página (F5) em qualquer tela funciona. |
| Arquivo com extensão que não existe (`/assets/antigo.js`) | `404` em JSON. |

A API vive em `/api` justamente para não colidir com as telas do front-end, que
usam `/projetos`.

### Variáveis de ambiente em produção

Todas são do back-end (`backend/.env` ou ambiente do servidor). Nenhuma é obrigatória.

| Variável | Para quê |
| --- | --- |
| `NODE_ENV=production` | Ativa o modo de produção: desliga o CORS padrão de desenvolvimento e o modo de desenvolvimento do Express. |
| `PORT` | Porta em que a aplicação responde (padrão `3001`). |
| `PASTA_FRONTEND` | Pasta do front-end compilado (padrão `frontend/dist`). |
| `BANCO` | Banco onde os projetos são gravados: `mongodb` (padrão) ou `postgres`. |
| `MONGODB_URI` | Endereço do MongoDB, com `BANCO=mongodb` (padrão `mongodb://localhost:27017/gerenciador-projetos`). |
| `POSTGRES_URL` | Endereço do PostgreSQL, com `BANCO=postgres` (padrão `postgresql://psw:psw@localhost:5432/gerenciador_projetos`). |
| `CORS_ORIGIN` | **Não use** em produção com o front-end servido pelo back-end. Só é necessária se outro site precisar chamar a API. |

> Se você copiou o `.env` de desenvolvimento para o servidor, ele pode trazer
> `CORS_ORIGIN=http://localhost:5173` (era o padrão do `.env.example` antigo).
> Remova essa linha: em produção ela libera um endereço que não existe.

### Atualizar uma versão

```bash
git pull
npm ci && npm run build && npm prune --omit=dev
npm run prisma:migrar -w backend   # só com BANCO=postgres: aplica migrações novas
# reinicie o back-end (ele detecta o front-end compilado ao iniciar)
```

Os projetos ficam no banco e não são apagados por atualizações.

### Cuidados

- **Banco com senha.** O container do README do back-end não tem usuário nem senha:
  serve para desenvolvimento (o do PostgreSQL usa a senha fraca `psw`). Em um
  servidor, use um banco com senha forte e informe-a na `MONGODB_URI` ou na `POSTGRES_URL`.
- **Backup.** Os projetos estão só no banco: faça cópias periódicas dele (por
  exemplo, com `mongodump` ou `pg_dump`).
- **Manter no ar.** `npm start` termina quando o terminal fecha. Em um servidor,
  use um gerenciador de processos (como `pm2` ou `systemd`) para iniciar com a
  máquina e reiniciar em caso de falha.
- **HTTPS.** A aplicação fala HTTP. Para HTTPS, coloque na frente um proxy
  reverso (como nginx ou Caddy) apontando para a porta da aplicação.

### Testar a produção localmente

```bash
curl -i http://localhost:3001/api/projetos     # JSON
curl -i http://localhost:3001/projetos/novo    # HTML (index.html)
```

## Convenções do repositório

- Um único repositório git para as duas pastas. Os commits podem tocar em
  `frontend/`, em `backend/` ou em ambos.
- Cada pasta tem seu `.env.example` (quando precisa) e seu lint (`npm run lint`).

### Monorepo (npm workspaces)

A raiz declara os três pacotes em `workspaces` (no `package.json`). Com isso:

- **Uma instalação só.** `npm install` (na raiz ou dentro de qualquer pasta) instala
  tudo em um único `node_modules/` na raiz, com um único `package-lock.json`. As pastas
  não têm `node_modules` nem lockfile próprios.
- **Pacote local.** O front-end e o back-end declaram
  `"@gerenciador-de-projetos/compartilhado"` nas dependências do seu `package.json`,
  como qualquer pacote, e o importam pelo nome:

  ```js
  import { schemaProjeto } from '@gerenciador-de-projetos/compartilhado'
  ```

  O npm liga esse nome à pasta `compartilhado/` (um link simbólico em
  `node_modules/`), então uma alteração lá vale na hora, sem reinstalar. O zod também
  fica instalado uma vez só, e os três pacotes usam a mesma cópia.
- **Comandos de um pacote a partir da raiz:** `npm run <script> -w backend` (ou
  `-w frontend`, `-w compartilhado`). Dentro da pasta, `npm run <script>` continua
  funcionando.
- **Dependência nova** de um pacote: `npm install <pacote> -w backend`.
- **Repositório inteiro.** Por depender do pacote compartilhado, o back-end precisa do
  repositório inteiro (não só da pasta `backend/`) para ser instalado e executado.
- Código, nomes e mensagens em português.

## Licença

Distribuído sob a licença MIT. Veja o arquivo [`LICENSE`](LICENSE).
