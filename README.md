# Gerenciador de Projetos

Exemplo de aplicação da disciplina de PSW no CEFET/RJ: CRUD de projetos com
front-end em React e back-end em Node.js com Express.

Os dois projetos vivem **neste mesmo repositório**, em pastas separadas, cada
um com seu próprio `package.json` e suas próprias dependências.

| Pasta | O que é | Situação |
| --- | --- | --- |
| [`frontend/`](frontend) | Aplicação web (React, Vite, Bootstrap) | Pronto. Usa uma API simulada com json-server. |
| [`backend/`](backend) | API REST (Node.js, Express) | Em construção. Existem `GET`, `POST` e `PUT` em `/projetos`, com dados em memória. |

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

## Convenções do repositório

- Um único repositório git para as duas pastas. Os commits podem tocar em
  `frontend/`, em `backend/` ou em ambos.
- Cada pasta tem seu `.gitignore`, seu `.env.example` e seu lint (`npm run lint`).
- Código, nomes e mensagens em português.

## Licença

Distribuído sob a licença MIT. Veja o arquivo [`LICENSE`](LICENSE).
