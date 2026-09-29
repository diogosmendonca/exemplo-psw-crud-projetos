# Sistema de Gerenciamento de Projetos

Aplicação web para cadastrar, consultar, alterar e excluir projetos (CRUD).
O front-end é feito em React e consome uma API REST simulada com
[json-server](https://github.com/typicode/json-server).

## Sumário

- [Tecnologias](#tecnologias)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Manual de instalação](#manual-de-instalação)
- [Manual de operação](#manual-de-operação)
- [Manual do usuário](#manual-do-usuário)
- [Design system](#design-system)
- [Solução de problemas](#solução-de-problemas)
- [Licença](#licença)

## Tecnologias

| Área | Tecnologia |
| --- | --- |
| Interface | React 19, Vite, react-router-dom |
| Dados remotos | @tanstack/react-query |
| Formulários e validação | react-hook-form, zod |
| Estilo e componentes | Bootstrap 5 (via Sass), react-bootstrap e design system próprio |
| Ícones | lucide-react |
| API simulada | json-server |
| Qualidade | oxlint |

## Estrutura do repositório

```text
.
├── .cursor/rules/design-system.mdc   # Regra para agentes de IA (Cursor)
├── dados/projetos.json               # Dados de exemplo usados pelo json-server
├── .env.example                      # Modelo de configuração (URL da API)
├── src/
│   ├── api/                          # Chamadas HTTP à API
│   ├── aviso/                        # Toast de sucesso (AvisoProvider e useAviso)
│   ├── design-system/                # Tokens, tema Bootstrap e componentes (+ README próprio)
│   ├── hooks/                        # Hooks do react-query (lista, projeto por id, mutações)
│   ├── schemas/                      # Validação dos formulários (zod)
│   ├── App.jsx                       # Rotas
│   ├── Cabecalho.jsx                 # Barra de navegação
│   ├── Lista.jsx                     # Listagem de projetos
│   ├── FormularioProjeto.jsx         # Inclusão e alteração
│   ├── ConfirmacaoExclusao.jsx       # Modal de exclusão
│   └── main.jsx                      # Ponto de entrada
├── index.html
├── LICENSE
├── package.json
└── vite.config.js
```

## Manual de instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) 22.12 ou superior (inclui o `npm`).
- [Git](https://git-scm.com/).
- Portas livres: `3000` (API) e `5173` (aplicação).

Para conferir as versões instaladas:

```bash
node --version
npm --version
```

### Passo a passo

1. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/diogosmendonca/exemplo-psw-crud-projetos.git
   cd exemplo-psw-crud-projetos
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

Não é preciso instalar o json-server à parte: ele já é uma dependência de
desenvolvimento do projeto.

## Manual de operação

O sistema precisa de **dois processos** rodando ao mesmo tempo. Abra dois
terminais na pasta do projeto.

### 1. Subir a API (terminal 1)

```bash
npm run api
```

A API fica em `http://localhost:3000`. Para conferir, abra
<http://localhost:3000/projetos> no navegador: deve aparecer a lista em JSON.

### 2. Subir a aplicação (terminal 2)

```bash
npm run dev
```

Acesse <http://localhost:5173>. A rota inicial redireciona para a listagem
de projetos.

### Comandos disponíveis

| Comando | O que faz |
| --- | --- |
| `npm run api` | Inicia o json-server em `http://localhost:3000` usando `dados/projetos.json`. |
| `npm run dev` | Inicia a aplicação em modo de desenvolvimento, com recarga automática. |
| `npm run build` | Gera a versão de produção na pasta `dist/`. |
| `npm run preview` | Serve localmente a versão gerada por `npm run build`. |
| `npm run lint` | Executa o oxlint para verificar o código. |

### Dados e persistência

- Os dados ficam no arquivo `dados/projetos.json`, que o json-server lê e
  **grava** a cada inclusão, alteração ou exclusão.
- Para voltar aos dados de exemplo originais, com a API parada:

  ```bash
  git checkout -- dados/projetos.json
  ```

- Para começar com a lista vazia, deixe o arquivo assim: `{ "projetos": [] }`.

### Endpoints da API

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/projetos` | Lista os projetos |
| `GET` | `/projetos/:id` | Busca um projeto |
| `POST` | `/projetos` | Cria um projeto |
| `PUT` | `/projetos/:id` | Substitui um projeto |
| `DELETE` | `/projetos/:id` | Exclui um projeto |

Exemplo de projeto:

```json
{
  "id": 1,
  "nome": "Portal do Aluno",
  "status": "ativo",
  "descricao": "Portal web para consulta de notas, faltas e horários.",
  "tecnologias": ["React", "Vite", "Bootstrap"],
  "url": "https://exemplo.com/portal-do-aluno"
}
```

### Rotas da aplicação

| Rota | Tela |
| --- | --- |
| `/projetos` | Listagem |
| `/projetos/novo` | Formulário de novo projeto |
| `/projetos/:id` | Formulário de alteração |
| `/projetos/:id/excluir` | Listagem com o modal de confirmação de exclusão |

### Publicação (produção)

```bash
npm run build
```

Os arquivos estáticos ficam em `dist/` e podem ser servidos por qualquer
servidor web.

### Configuração da URL da API

Por padrão a aplicação usa a API em `http://localhost:3000`. Para apontar para
outro endereço, crie um arquivo `.env` (há um modelo em `.env.example`):

```bash
cp .env.example .env
```

```dotenv
VITE_API_URL=https://minha-api.exemplo.com
```

Informe apenas o endereço base, sem `/projetos` no final. Reinicie o
`npm run dev` após alterar o `.env`. Em produção, defina `VITE_API_URL`
**antes** do `npm run build`, pois o valor é embutido no código gerado.

## Manual do usuário

### Visão geral

O sistema tem uma barra de navegação no topo, com dois itens:

- **Projetos**: abre a listagem.
- **Novo projeto**: abre o formulário de cadastro.

Em telas pequenas (celular), a barra vira um botão de menu (☰). O menu fecha
sozinho ao tocar fora dele.

### Consultar projetos

1. Clique em **Projetos** no menu.
2. Cada projeto mostra o nome e o status (**ativo** em verde, **inativo** em
   cinza).
3. Use o campo **Filtrar projetos** para ver **Todos**, apenas **Ativos** ou
   apenas **Inativos**.

No computador, os projetos aparecem em uma tabela. No celular, aparecem em
cartões com botões grandes, para facilitar o toque.

### Cadastrar um projeto

1. Clique em **Novo projeto** (no menu ou no botão acima da lista).
2. Preencha os campos:

   | Campo | Obrigatório | Como preencher |
   | --- | --- | --- |
   | Nome | Sim | Nome do projeto. |
   | Estado | Sim | **Ativo** ou **Inativo**. |
   | Descrição | Não | Texto livre. |
   | Tecnologias | Não | Separadas por vírgula. Ex.: `React, Node.js, PostgreSQL`. |
   | URL | Não | Endereço completo. Ex.: `https://exemplo.com`. |

3. Clique em **Salvar projeto**.
4. Você volta para a listagem e vê o aviso verde
   "*nome* foi incluído com sucesso."

Para desistir, clique em **Voltar**.

### Alterar um projeto

1. Na listagem, clique em **Alterar** no projeto desejado.
2. Edite os campos e clique em **Salvar projeto**.
3. O aviso "*nome* foi alterado com sucesso." confirma a alteração.

### Excluir um projeto

1. Na listagem, clique em **Excluir** no projeto desejado.
2. Uma janela pergunta se você deseja excluir o projeto.
3. Clique em **Excluir projeto** para confirmar, ou em **Voltar** para
   cancelar.
4. Ao confirmar, o aviso "*nome* foi excluído com sucesso." aparece.

> A exclusão não pode ser desfeita.

### Avisos e mensagens

- **Aviso verde no canto superior direito**: operação concluída. Some sozinho
  após 5 segundos; ao passar o mouse sobre ele, a contagem pausa. Use o **X**
  para fechá-lo antes.
- **Mensagem vermelha**: algo deu errado (por exemplo, a API está fora do ar).
  Confira se o `npm run api` está em execução e tente novamente.
- **Texto vermelho sob um campo**: o campo está inválido ou obrigatório e
  precisa ser corrigido antes de salvar.

## Design system

O visual do sistema é definido em `src/design-system/`:

- **Guia completo**, com tokens, componentes e regras:
  [`src/design-system/README.md`](src/design-system/README.md).
- **Tokens** (cores, fonte, bordas), em um único lugar:
  `src/design-system/tokens.scss`. Para mudar a cor principal, altere
  `$ds-cor-primaria`.
- **Componentes reutilizáveis**: `Alerta`, `Carregando`, `CampoFormulario`,
  `StatusBadge` e `TituloPagina`, exportados por `src/design-system/index.js`.
- **Regra para agentes de IA** (Cursor):
  [`.cursor/rules/design-system.mdc`](.cursor/rules/design-system.mdc).

## Solução de problemas

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| Mensagem "Não foi possível conectar à API…" | API parada ou `VITE_API_URL` incorreta | Rode `npm run api` (ou confira o endereço no `.env`) e recarregue a página. |
| `EADDRINUSE` na porta 3000 ou 5173 | Outro processo usa a porta | Encerre o processo que está usando a porta ou feche o terminal antigo. |
| Erro de versão do Node ao instalar ou rodar | Node desatualizado | Atualize para o Node 22.12 ou superior. |
| Alterações não aparecem após editar `dados/projetos.json` | Arquivo editado com a API rodando | Pare a API, edite o arquivo e suba a API novamente. |

## Licença

Distribuído sob a licença MIT. Veja o arquivo [`LICENSE`](LICENSE).
