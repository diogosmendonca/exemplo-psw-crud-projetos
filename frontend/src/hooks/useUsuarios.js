import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  atualizarUsuario,
  buscarUsuario,
  cadastrarUsuario,
  excluirUsuario,
  listarUsuarios,
} from '../api/usuarios.js'
import { autenticacaoQueryKey } from './useAutenticacao.js'

export const usuariosQueryKey = ['usuarios']

/** Gerentes de projetos, para o administrador associar a um projeto. */
export function useGerentes(habilitado) {
  const gerentesQuery = useQuery({
    queryKey: [...usuariosQueryKey, 'gerentes'],
    queryFn: async () => (await listarUsuarios()).filter((usuario) => usuario.perfil === 'gerente'),
    enabled: habilitado,
  })

  return {
    gerentes: gerentesQuery.data ?? [],
    erro: gerentesQuery.error?.message ?? '',
  }
}

export function useUsuarios() {
  const usuariosQuery = useQuery({
    queryKey: usuariosQueryKey,
    queryFn: listarUsuarios,
  })

  return {
    usuarios: usuariosQuery.data ?? [],
    carregando: usuariosQuery.isLoading,
    erro: usuariosQuery.error?.message ?? '',
  }
}

export function useUsuario(id) {
  const usuarioQuery = useQuery({
    queryKey: [...usuariosQueryKey, String(id)],
    queryFn: () => buscarUsuario(id),
    enabled: Boolean(id),
    gcTime: 0,
    refetchOnWindowFocus: false,
  })

  return {
    usuario: usuarioQuery.data ?? null,
    carregando: usuarioQuery.isLoading,
    erro: usuarioQuery.error?.message ?? '',
  }
}

export function useMutacoesUsuarios() {
  const queryClient = useQueryClient()
  const recarregar = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: usuariosQueryKey, exact: true }),
      queryClient.invalidateQueries({ queryKey: [...usuariosQueryKey, 'gerentes'] }),
      queryClient.invalidateQueries({ queryKey: autenticacaoQueryKey }),
    ])

  const criarMutation = useMutation({ mutationFn: cadastrarUsuario, onSuccess: recarregar })
  const atualizarMutation = useMutation({ mutationFn: atualizarUsuario, onSuccess: recarregar })
  const excluirMutation = useMutation({
    mutationFn: excluirUsuario,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usuariosQueryKey, exact: true }),
  })

  return {
    criarUsuario: criarMutation.mutateAsync,
    atualizarUsuario: (id, dados) => atualizarMutation.mutateAsync({ id, dados }),
    excluirUsuario: excluirMutation.mutateAsync,
  }
}
