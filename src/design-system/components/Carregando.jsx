/**
 * Indicador de carregamento (spinner + texto).
 *
 * Quando usar: enquanto dados são buscados da API (lista, formulário de edição,
 * modal de exclusão).
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.children] Texto exibido. Padrão: "Carregando...".
 *
 * @example
 * <Carregando>Carregando projetos...</Carregando>
 */
function Carregando({ children = 'Carregando...' }) {
  return (
    <div className="d-flex align-items-center gap-2 text-secondary" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
      {children}
    </div>
  )
}

export default Carregando
