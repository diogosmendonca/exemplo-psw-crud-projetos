import { createContext, useContext } from 'react'

/**
 * Contexto do aviso de sucesso (toast).
 * O valor é fornecido por `AvisoProvider` (ver `AvisoProvider.jsx`).
 */
export const AvisoContext = createContext(null)

/**
 * Hook para exibir o toast de sucesso de qualquer tela.
 *
 * @returns {{ mostrarSucesso: (texto: string) => void }}
 *
 * @example
 * const { mostrarSucesso } = useAviso()
 * await criarProjeto(dados)
 * mostrarSucesso(`${dados.nome} foi incluído com sucesso.`)
 * navigate('/projetos')
 */
export function useAviso() {
  const contexto = useContext(AvisoContext)

  if (!contexto) {
    throw new Error('useAviso deve ser usado dentro de <AvisoProvider>.')
  }

  return contexto
}
