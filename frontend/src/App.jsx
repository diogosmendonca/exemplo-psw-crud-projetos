import { Navigate, Route, Routes } from 'react-router-dom'
import AvisoProvider from './aviso/AvisoProvider.jsx'
import Lista from './Lista.jsx'
import FormularioLogin from './FormularioLogin.jsx'
import FormularioProjeto from './FormularioProjeto.jsx'
import FormularioRegistro from './FormularioRegistro.jsx'
import FormularioUsuario from './FormularioUsuario.jsx'
import ConfirmacaoExclusao from './ConfirmacaoExclusao.jsx'
import ConfirmacaoExclusaoUsuario from './ConfirmacaoExclusaoUsuario.jsx'
import LayoutAutenticado from './LayoutAutenticado.jsx'
import ListaUsuarios from './ListaUsuarios.jsx'
import SomenteAdministrador from './SomenteAdministrador.jsx'

function App() {
  return (
    <AvisoProvider>
      <Routes>
        <Route
          path="/entrar"
          element={
            <main className="container py-4">
              <FormularioLogin />
            </main>
          }
        />
        <Route path="/registrar" element={<FormularioRegistro />} />
        <Route element={<LayoutAutenticado />}>
          {/* A exclusão é um modal sobre a lista: rota filha, para a lista
              (e o filtro escolhido) continuar montada por trás. */}
          <Route path="/projetos" element={<Lista />}>
            <Route path=":id/excluir" element={<ConfirmacaoExclusao />} />
          </Route>
          <Route path="/projetos/novo" element={<FormularioProjeto />} />
          <Route path="/projetos/:id" element={<FormularioProjeto />} />
          <Route
            path="/usuarios"
            element={
              <SomenteAdministrador>
                <ListaUsuarios />
              </SomenteAdministrador>
            }
          >
            <Route path=":id/excluir" element={<ConfirmacaoExclusaoUsuario />} />
          </Route>
          <Route
            path="/usuarios/novo"
            element={
              <SomenteAdministrador>
                <FormularioUsuario />
              </SomenteAdministrador>
            }
          />
          <Route
            path="/usuarios/:id"
            element={
              <SomenteAdministrador>
                <FormularioUsuario />
              </SomenteAdministrador>
            }
          />
          <Route path="*" element={<Navigate to="/projetos" replace />} />
        </Route>
      </Routes>
    </AvisoProvider>
  )
}

export default App
