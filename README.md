# Gerenciador de Projetos

Exemplo de aplicação da disciplina de PSW no CEFET/RJ: CRUD de projetos com
front-end em React e back-end em Node.js com Express.

Os dois projetos vivem **neste mesmo repositório**, em pastas separadas, cada
um com seu próprio `package.json` e suas próprias dependências.

| Pasta | O que é | Situação |
| --- | --- | --- |
| [`frontend/`](frontend) | Aplicação web (React, Vite, Bootstrap) | Pronto. Funciona com o back-end ou com a API simulada (json-server). |
| [`backend/`](backend) | API REST (Node.js, Express) | CRUD completo em `/api/projetos`, com dados gravados em arquivo JSON. Também serve o front-end compilado em produção. |

## Estrutura

```text
.
├── .cursor/rules/    # Regras para agentes de IA (Cursor)
├── backend/          # API (Node.js + Express)
├── frontend/         # Aplicação web (React + Vite)
├── LICENSE
└── README.md
```

## Como executar

Pré-requisito: [Node.js](https://nodejs.org/) 22.12 ou superior.

```bash
git clone https://github.com/diogosmendonca/exemplo-psw-crud-projetos.git
cd exemplo-psw-crud-projetos
```

Cada pasta é instalada e executada separadamente:

- **Front-end** (com a API simulada): veja o [manual do front-end](frontend/README.md).
- **Back-end**: veja o [README do back-end](backend/README.md).

### Front-end com o back-end

Em dois terminais:

```bash
# Terminal 1 - API em http://localhost:3001/api/projetos
cd backend
npm install
npm run dev
```

```bash
# Terminal 2 - aplicação em http://localhost:5173
cd frontend
npm install
cp .env.example .env     # já aponta para o back-end (VITE_API_URL=http://localhost:3001/api)
npm run dev
```

Os projetos do back-end são gravados em `backend/dados/projetos.json` (criado na
primeira execução, a partir de um arquivo de exemplo) e sobrevivem a reinícios.
Veja os detalhes no [README do back-end](backend/README.md#armazenamento).

## Implantação em produção

Em produção **um único processo** entrega tudo: o back-end serve a API (em
`/api`) e também os arquivos compilados do front-end. Isso traz duas vantagens:
só há um endereço para publicar e **não é preciso configurar CORS**, porque a
aplicação e a API ficam na mesma origem.

### Passo a passo

1. **Compile o front-end** (gera `frontend/dist`):

   ```bash
   cd frontend
   npm ci
   npm run build
   ```

   O build lê `frontend/.env.production`, que já define `VITE_API_URL=/api`, então
   o código compilado chama a API na própria origem. Não é preciso configurar nada.

2. **Instale e inicie o back-end** em modo de produção:

   ```bash
   cd ../backend
   npm ci --omit=dev
   NODE_ENV=production npm start
   ```

   No Windows (PowerShell): `$env:NODE_ENV="production"; npm start`. Em qualquer
   sistema, também vale colocar `NODE_ENV=production` em `backend/.env`.

3. **Acesse** <http://localhost:3001>. A porta muda com a variável `PORT`.

Ao iniciar, o back-end informa o que está servindo:

```text
Modo: produção
API em http://localhost:3001/api/projetos
Dados gravados em .../backend/dados/projetos.json
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
| `ARQUIVO_DADOS` | Onde os projetos são gravados (padrão `backend/dados/projetos.json`). Aponte para um disco/volume que persista. |
| `PASTA_FRONTEND` | Pasta do front-end compilado (padrão `frontend/dist`). |
| `CORS_ORIGIN` | **Não use** em produção com o front-end servido pelo back-end. Só é necessária se outro site precisar chamar a API. |

> Se você copiou o `.env` de desenvolvimento para o servidor, ele pode trazer
> `CORS_ORIGIN=http://localhost:5173` (era o padrão do `.env.example` antigo).
> Remova essa linha: em produção ela libera um endereço que não existe.

### Atualizar uma versão

```bash
git pull
cd frontend && npm ci && npm run build
cd ../backend && npm ci --omit=dev
# reinicie o back-end (ele detecta o front-end compilado ao iniciar)
```

Os dados em `backend/dados/projetos.json` não são alterados por atualizações.

### Cuidados

- **Uma instância só.** Os dados ficam em um arquivo JSON, que não suporta dois
  processos escrevendo ao mesmo tempo. Não rode várias réplicas.
- **Backup.** Copie `backend/dados/projetos.json` periodicamente: ele é todo o seu "banco".
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
- Cada pasta tem seu `.gitignore`, seu `.env.example` e seu lint (`npm run lint`).
- Código, nomes e mensagens em português.

## Licença

Distribuído sob a licença MIT. Veja o arquivo [`LICENSE`](LICENSE).
