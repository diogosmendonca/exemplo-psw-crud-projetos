import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  atualizarProjeto,
  criarProjeto,
  excluirProjeto,
  listarProjetos,
} from '../api/projetos.js'

export const projetosQueryKey = ['projetos']

export function useProjetos() {
  const queryClient = useQueryClient()
  const projetosQuery = useQuery({
    queryKey: projetosQueryKey,
    queryFn: listarProjetos,
  })

  const criarMutation = useMutation({
    mutationFn: criarProjeto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projetosQueryKey }),
  })

  const atualizarMutation = useMutation({
    mutationFn: atualizarProjeto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projetosQueryKey }),
  })

  const excluirMutation = useMutation({
    mutationFn: excluirProjeto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projetosQueryKey }),
  })

  return {
    projetos: projetosQuery.data ?? [],
    carregando: projetosQuery.isLoading,
    erro: projetosQuery.error?.message ?? '',
    criarProjeto: criarMutation.mutateAsync,
    atualizarProjeto: (id, dadosProjeto) =>
      atualizarMutation.mutateAsync({ id, dadosProjeto }),
    excluirProjeto: excluirMutation.mutateAsync,
  }
}
