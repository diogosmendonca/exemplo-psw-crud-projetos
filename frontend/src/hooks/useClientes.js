import { useQuery } from '@tanstack/react-query'
import { listarClientes } from '../api/clientes.js'

export const clientesQueryKey = ['clientes']

/** Clientes já cadastrados, para as sugestões do campo "Cliente". */
export function useClientes() {
  const clientesQuery = useQuery({
    queryKey: clientesQueryKey,
    queryFn: listarClientes,
  })

  return { clientes: clientesQuery.data ?? [] }
}
