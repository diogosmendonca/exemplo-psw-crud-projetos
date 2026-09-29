/**
 * Selo que mostra o status de um projeto.
 *
 * Mapeamento status -> cor (mantido aqui para que toda tela use o mesmo):
 *   - "ativo"   -> verde (sucesso)
 *   - "inativo" -> cinza (secundária)
 *
 * @param {object} props
 * @param {'ativo'|'inativo'} props.status
 *
 * @example
 * <StatusBadge status={projeto.status} />
 */
function StatusBadge({ status }) {
  const variante = status === 'ativo' ? 'text-bg-success' : 'text-bg-secondary'

  return <span className={`badge ${variante}`}>{status}</span>
}

export default StatusBadge
