// Significado da mensagem -> variante Bootstrap.
const VARIANTES = {
  perigo: 'danger',
  aviso: 'warning',
  info: 'info',
  sucesso: 'success',
  neutro: 'secondary',
}

/**
 * Mensagem em bloco para erros, avisos e informações.
 * Para confirmação de sucesso após uma ação, use o toast (`AvisoSucesso`).
 *
 * Quando usar: erro de carregamento, erro do servidor num formulário,
 * "projeto não encontrado", lista vazia.
 *
 * @param {object} props
 * @param {'perigo'|'aviso'|'info'|'sucesso'|'neutro'} [props.tipo='perigo']
 *   Significado da mensagem. Define a cor. `perigo` e `aviso` são anunciados
 *   imediatamente por leitores de tela (role="alert").
 * @param {string} [props.className] Classes extras (ex.: `mt-3 mb-0`).
 * @param {import('react').ReactNode} props.children Texto da mensagem.
 *
 * @example
 * <Alerta>Não foi possível carregar os projetos.</Alerta>
 * <Alerta tipo="neutro">Nenhum projeto encontrado.</Alerta>
 */
function Alerta({ tipo = 'perigo', className = '', children }) {
  const urgente = tipo === 'perigo' || tipo === 'aviso'

  return (
    <div
      className={`alert alert-${VARIANTES[tipo]} ${className}`.trim()}
      role={urgente ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}

export default Alerta
