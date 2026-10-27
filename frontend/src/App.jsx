import { Navigate, Route, Routes } from 'react-router-dom'
import AvisoProvider from './aviso/AvisoProvider.jsx'
import Lista from './Lista.jsx'
import FormularioLogin from './FormularioLogin.jsx'
import FormularioProjeto from './FormularioProjeto.jsx'
import FormularioUsuario from './FormularioUsuario.jsx'
import ConfirmacaoExclusao from './ConfirmacaoExclusao.jsx'
import LayoutAutenticado from './LayoutAutenticado.jsx'

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
        <Route element={<LayoutAutenticado />}>
          {/* A exclusão é um modal sobre a lista: rota filha, para a lista
              (e o filtro escolhido) continuar montada por trás. */}
          <Route path="/projetos" element={<Lista />}>
            <Route path=":id/excluir" element={<ConfirmacaoExclusao />} />
          </Route>
          <Route path="/projetos/novo" element={<FormularioProjeto />} />
          <Route path="/projetos/:id" element={<FormularioProjeto />} />
          <Route path="/usuarios/novo" element={<FormularioUsuario />} />
          <Route path="*" element={<Navigate to="/projetos" replace />} />
        </Route>
      </Routes>
    </AvisoProvider>
  )
}

export default App
