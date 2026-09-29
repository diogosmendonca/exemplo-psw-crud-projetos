# Design System — Gerenciador de Projetos

Guia oficial do visual e dos componentes de UI deste sistema.
Escrito para pessoas **e para agentes de IA**: siga as regras da seção
"Regras obrigatórias" ao criar ou alterar qualquer tela.

## Resumo

- Base: **Bootstrap 5.3** compilado via **Sass** (`theme.scss`).
- Cor principal da marca: **verde** `#157a4f` (token `$ds-cor-primaria`).
- Fonte única de decisões visuais: `tokens.scss`.
- Componentes reutilizáveis: `components/`, importados de `src/design-system`.
- Idioma: nomes de componentes, props e textos da interface em **português**.

## Estrutura de arquivos

| Arquivo | Papel |
| --- | --- |
| `tokens.scss` | Cores, fonte, raio de borda, tamanho de toque. **Único lugar para editar o visual global.** |
| `theme.scss` | Importa os tokens, depois o Bootstrap inteiro, depois utilitários `.ds-*`. Importado em `src/main.jsx`. |
| `index.js` | Exporta todos os componentes. Importe sempre daqui. |
| `components/*.jsx` | Componentes React. Cada um tem JSDoc com props e exemplo. |

## Tokens

| Token (`tokens.scss`) | Valor atual | Uso |
| --- | --- | --- |
| `$ds-cor-primaria` | `#157a4f` (verde) | Navbar, `btn-primary`, links, foco de campos |
| `$ds-cor-sucesso` | `#198754` | Toast de sucesso, status "ativo" |
| `$ds-cor-perigo` | `#dc3545` | Exclusão e erros |
| `$ds-cor-aviso` | `#ffc107` | Atenção |
| `$ds-cor-info` | `#0dcaf0` | Informação |
| `$ds-cor-secundaria` | `#6c757d` | Ações de apoio, status "inativo" |
| `$ds-fonte-base` | fontes do sistema | Todo o texto |
| `$ds-raio-borda` | `0.5rem` | Botões, campos, cartões |
| `$ds-alvo-toque-minimo` | `2.75rem` (44px) | Altura mínima de alvo de toque |

### Como mudar a cor principal (ou qualquer token)

1. Edite o valor em `tokens.scss` (ex.: `$ds-cor-primaria: #0d6efd;`).
2. Não é necessário mudar mais nada: navbar, botões, links e foco atualizam sozinhos.
3. Verifique contraste com texto branco ≥ 4,5:1 (WCAG AA).

## Componentes

Importe assim: `import { Alerta, Carregando } from './design-system'`.

| Componente | Quando usar | Props principais |
| --- | --- | --- |
| `Alerta` | Erro, aviso ou mensagem em bloco (erro de API, "não encontrado", lista vazia) | `tipo`: `perigo` (padrão) \| `aviso` \| `info` \| `sucesso` \| `neutro`; `className` |
| `Carregando` | Enquanto dados são buscados | `children` (texto) |
| `CampoFormulario` | Qualquer campo de formulário (rótulo + controle + erro) | `id`, `rotulo`, `erro`, `tipo`: `texto` (padrão) \| `select` \| `textarea`; demais props vão ao controle |
| `StatusBadge` | Mostrar status `ativo`/`inativo` | `status` |
| `TituloPagina` | Título principal de uma tela | `children` |

Componentes de comportamento (fora do design system, mas parte do padrão de UX):

| Componente | Papel |
| --- | --- |
| `src/aviso/AvisoProvider.jsx` | Envolve o app (em `App.jsx`) e renderiza o toast verde no topo. Some após 5s; pausa com mouse/foco. |
| `src/aviso/contexto.js` | Exporta `useAviso()`, que devolve `{ mostrarSucesso(texto) }`. |
| `src/Cabecalho.jsx` | Navbar responsiva com ícone + nome por item; menu (`react-bootstrap`) recolhe ao tocar fora, ao perder o foco e ao escolher um item. Itens definidos em `ITENS_MENU`. |

## Padrões de UX (decisões já tomadas)

| Situação | Padrão |
| --- | --- |
| Confirmar sucesso de incluir/alterar/excluir | **Toast**: `const { mostrarSucesso } = useAviso()` e depois `mostrarSucesso('Texto.')` |
| Componentes interativos (modal, menu recolhível, dropdown) | Use `react-bootstrap`. **Não** use o JavaScript do Bootstrap (`data-bs-*`, `new Modal()`): ele manipula o DOM fora do React |
| Confirmar exclusão | **Modal** do `react-bootstrap` (`ConfirmacaoExclusao.jsx`), nunca `window.confirm`. É rota filha de `Lista` (`<Outlet />`), para a lista e o filtro continuarem por trás |
| Ordem dos botões (formulários e modais) | **Principal à esquerda, secundário à direita** (ex.: `Salvar` \| `Voltar`; `Excluir projeto` \| `Voltar`). Em `modal-footer` use `justify-content-start` |
| Itens de menu | Ícone `lucide-react` (18px) + nome, em `ITENS_MENU` de `Cabecalho.jsx` |
| Lista em telas < `lg` | **Cartões** (`card`); em `lg` ou mais, **tabela** (`table-responsive`) |
| Ações em cartão no mobile | Botões com texto + ícone, largura dividida, `ds-alvo-toque` |
| Erro de campo | `CampoFormulario` com prop `erro` (mensagem abaixo do campo) |
| Erro de servidor em formulário | `<Alerta>` acima dos botões |
| Botão principal da tela | `btn btn-primary`; secundário `btn btn-outline-secondary`; destrutivo `btn btn-danger` |
| Ícones | `lucide-react`, sempre com `aria-hidden="true"` e texto/`aria-label` acessível |

## Regras obrigatórias

1. **Reutilize antes de criar.** Se existe componente em `components/`, use-o.
2. **Nunca use cores em hexadecimal/RGB** em JSX ou CSS de tela. Use classes Bootstrap
   (`btn-primary`, `text-bg-success`, `text-secondary`) ou tokens em `tokens.scss`.
3. **Não crie arquivos `.css` de tela.** Use classes utilitárias do Bootstrap
   (`d-flex`, `gap-2`, `mb-3`, `col-md-4`...). Se realmente faltar algo, crie um
   utilitário `.ds-*` em `theme.scss` e documente aqui.
4. **Alvos de toque ≥ 44px:** botões/links de ação principal levam `ds-alvo-toque`.
5. **Responsivo primeiro:** desenhe para celular e use breakpoints Bootstrap
   (`md`, `lg`) para telas maiores.
6. **Acessibilidade:** todo campo tem `<label>`; erros usam `aria-describedby`
   (o `CampoFormulario` já faz); ícones sem texto têm `aria-label`.
7. **Não altere arquivos do Bootstrap** em `node_modules`.
8. **Ao adicionar componente novo:** crie em `components/`, escreva JSDoc
   (descrição, "Quando usar", props, `@example`), exporte em `index.js` e
   adicione uma linha na tabela "Componentes" deste arquivo.

## Exemplos

Campo com validação (react-hook-form):

```jsx
<CampoFormulario
  id="nome-projeto"
  rotulo="Nome"
  erro={errors.nome}
  {...register('nome')}
/>
```

Estados de uma tela de dados:

```jsx
{carregando && <Carregando>Carregando projetos...</Carregando>}
{erro && <Alerta>Não foi possível carregar os projetos.</Alerta>}
{!carregando && !erro && itens.length === 0 && (
  <Alerta tipo="neutro">Nenhum projeto encontrado.</Alerta>
)}
```

Botão de ação em tela pequena:

```jsx
<Link className="btn btn-primary ds-alvo-toque" to="/projetos/novo">Novo projeto</Link>
```

## O que evitar

```jsx
// ❌ cor fixa e estilo inline
<button style={{ background: '#157a4f' }}>Salvar</button>

// ✅ classe do tema
<button className="btn btn-primary">Salvar</button>

// ❌ campo montado à mão, repetindo classes e aria
<label>Nome</label><input className="form-control" />

// ✅ componente do design system
<CampoFormulario id="nome-projeto" rotulo="Nome" erro={errors.nome} {...register('nome')} />
```
