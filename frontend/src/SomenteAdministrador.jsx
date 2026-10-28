import { Navigate } from 'react-router-dom'
import { Carregando } from './design-system'
import { useAutenticacao } from './hooks/useAutenticacao.js'

/** Dentro da aplicação autenticada. Gerente volta para os projetos. */
function SomenteAdministrador({ children }) {
  const { usuario, carregando } = useAutenticacao()

  if (carregando) return <Carregando>Carregando...</Carregando>
  if (usuario?.perfil !== 'administrador') return <Navigate to="/projetos" replace />

  return children
}

export default SomenteAdministrador
