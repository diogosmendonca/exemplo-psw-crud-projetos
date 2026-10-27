import { useQuery } from '@tanstack/react-query'
import { obterUsuario } from '../api/token.js'

export const autenticacaoQueryKey = ['usuario-autenticado']

/** Usuário do JWT, ou `null` quando não há token válido. */
export function useAutenticacao() {
  const autenticacaoQuery = useQuery({
    queryKey: autenticacaoQueryKey,
    queryFn: obterUsuario,
    retry: false,
  })

  return {
    usuario: autenticacaoQuery.data ?? null,
    carregando: autenticacaoQuery.isLoading,
    erro: autenticacaoQuery.error?.message,
  }
}
