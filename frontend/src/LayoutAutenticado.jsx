import { useQueryClient } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router-dom'
import { sair } from './api/token.js'
import { Alerta, Carregando } from './design-system'
import Cabecalho from './Cabecalho.jsx'
import { useAutenticacao } from './hooks/useAutenticacao.js'

/** Telas da aplicação. Sem JWT válido, manda para a entrada. */
function LayoutAutenticado() {
  const queryClient = useQueryClient()
  const { usuario, carregando, erro } = useAutenticacao()

  const aoSair = () => {
    sair()
    queryClient.clear()
    window.location.assign('/entrar')
  }

  if (carregando) return <Carregando>Carregando...</Carregando>
  if (erro) return <Alerta>{erro}</Alerta>
  if (!usuario) return <Navigate to="/entrar" replace />

  return (
    <>
      <Cabecalho usuario={usuario} aoSair={aoSair} />
      <main className="container py-4">
        <Outlet />
      </main>
    </>
  )
}

export default LayoutAutenticado
