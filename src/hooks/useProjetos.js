import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  atualizarProjeto,
  buscarProjeto,
  criarProjeto,
  excluirProjeto,
  listarProjetos,
} from '../api/projetos.js'

export const projetosQueryKey = ['projetos']

/** Lista de todos os projetos. */
export function useProjetos() {
  const projetosQuery = useQuery({
    queryKey: projetosQueryKey,
    queryFn: listarProjetos,
  })

  return {
    projetos: projetosQuery.data ?? [],
    carregando: projetosQuery.isLoading,
    erro: projetosQuery.error?.message ?? '',
  }
}

/**
 * Um projeto pelo id. `projeto` é `null` quando não existe.
 * Sem `id` (tela de novo projeto) a busca fica desligada.
 * Não guarda cache depois de sair da tela, para o formulário abrir sempre
 * com os dados atuais.
 */
export function useProjeto(id) {
  const projetoQuery = useQuery({
    queryKey: [...projetosQueryKey, String(id)],
    queryFn: () => buscarProjeto(id),
    enabled: Boolean(id),
    gcTime: 0,
    refetchOnWindowFocus: false,
  })

  return {
    projeto: projetoQuery.data ?? null,
    carregando: projetoQuery.isLoading,
    erro: projetoQuery.error?.message ?? '',
  }
}

/** Ações de incluir, alterar e excluir. A lista é recarregada após cada uma. */
export function useMutacoesProjetos() {
  const queryClient = useQueryClient()
  // `exact`: só a lista. Recarregar o projeto individual após excluí-lo
  // devolveria 404 enquanto o modal de exclusão ainda está fechando.
  const recarregarLista = () =>
    queryClient.invalidateQueries({ queryKey: projetosQueryKey, exact: true })

  const criarMutation = useMutation({
    mutationFn: criarProjeto,
    onSuccess: recarregarLista,
  })

  const atualizarMutation = useMutation({
    mutationFn: atualizarProjeto,
    onSuccess: recarregarLista,
  })

  const excluirMutation = useMutation({
    mutationFn: excluirProjeto,
    onSuccess: recarregarLista,
  })

  return {
    criarProjeto: criarMutation.mutateAsync,
    atualizarProjeto: (id, dadosProjeto) =>
      atualizarMutation.mutateAsync({ id, dadosProjeto }),
    excluirProjeto: excluirMutation.mutateAsync,
  }
}
