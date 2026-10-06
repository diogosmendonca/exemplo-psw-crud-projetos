import { Navigate, Route, Routes } from 'react-router-dom'
import AvisoProvider from './aviso/AvisoProvider.jsx'
import Cabecalho from './Cabecalho.jsx'
import Lista from './Lista.jsx'
import FormularioProjeto from './FormularioProjeto.jsx'
import ConfirmacaoExclusao from './ConfirmacaoExclusao.jsx'

function App() {
  return (
    <AvisoProvider>
      <Cabecalho />
      <main className="container py-4">
        <Routes>
          {/* A exclusão é um modal sobre a lista: rota filha, para a lista
              (e o filtro escolhido) continuar montada por trás. */}
          <Route path="/projetos" element={<Lista />}>
            <Route path=":id/excluir" element={<ConfirmacaoExclusao />} />
          </Route>
          <Route path="/projetos/novo" element={<FormularioProjeto />} />
          <Route path="/projetos/:id" element={<FormularioProjeto />} />
          <Route path="*" element={<Navigate to="/projetos" replace />} />
        </Routes>
      </main>
    </AvisoProvider>
  )
}

export default App
