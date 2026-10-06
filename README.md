# Gerenciador de Projetos

Exemplo de aplicação da disciplina de PSW no CEFET/RJ: CRUD de projetos com
front-end em React e back-end em Node.js com Express.

Os dois projetos vivem **neste mesmo repositório**, em pastas separadas, cada
um com seu próprio `package.json` e suas próprias dependências.

| Pasta | O que é | Situação |
| --- | --- | --- |
| [`frontend/`](frontend) | Aplicação web (React, Vite, Bootstrap) | Pronto. Funciona com o back-end ou com a API simulada (json-server). |
| [`backend/`](backend) | API REST (Node.js, Express) | Em construção. CRUD completo em `/projetos`, com dados em memória. |

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
# Terminal 1 - API em http://localhost:3001
cd backend
npm install
npm run dev
```

```bash
# Terminal 2 - aplicação em http://localhost:5173
cd frontend
npm install
cp .env.example .env     # e defina VITE_API_URL=http://localhost:3001
npm run dev
```

Os projetos do back-end ficam em memória: ao reiniciar a API, voltam aos três
projetos de exemplo.

## Convenções do repositório

- Um único repositório git para as duas pastas. Os commits podem tocar em
  `frontend/`, em `backend/` ou em ambos.
- Cada pasta tem seu `.gitignore`, seu `.env.example` e seu lint (`npm run lint`).
- Código, nomes e mensagens em português.

## Licença

Distribuído sob a licença MIT. Veja o arquivo [`LICENSE`](LICENSE).
