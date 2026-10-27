import { useQuery } from '@tanstack/react-query'
import { obterSessao } from '../api/sessao.js'

export const sessaoQueryKey = ['sessao']

/** Usuário autenticado, ou `null` quando a sessão não existe. */
export function useSessao() {
  const sessaoQuery = useQuery({
    queryKey: sessaoQueryKey,
    queryFn: obterSessao,
    retry: false,
  })

  return {
    usuario: sessaoQuery.data ?? null,
    carregando: sessaoQuery.isLoading,
    erro: sessaoQuery.error?.message,
  }
}
