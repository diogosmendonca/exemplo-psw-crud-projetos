import { useCallback, useEffect, useMemo, useState } from 'react'
import { AvisoContext } from './contexto.js'

// Tempo, em ms, que o toast fica visível. Pausa enquanto o usuário
// passa o mouse ou foca no toast (acessibilidade: tempo suficiente para ler).
const DURACAO_MS = 5000

function ToastSucesso({ texto, aoFechar }) {
  const [pausado, setPausado] = useState(false)

  useEffect(() => {
    if (pausado) return

    const temporizador = setTimeout(aoFechar, DURACAO_MS)
    return () => clearTimeout(temporizador)
  }, [pausado, aoFechar])

  return (
    <div
      className="toast show align-items-center text-bg-success border-0"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div className="d-flex">
        <div className="toast-body">{texto}</div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          aria-label="Fechar"
          onClick={aoFechar}
        ></button>
      </div>
    </div>
  )
}

/**
 * Fornece `useAviso()` para toda a aplicação e renderiza o toast de sucesso.
 * Deve envolver as rotas (ver `App.jsx`).
 *
 * A região `role="status"` fica sempre no DOM: assim leitores de tela
 * anunciam a mensagem quando ela aparece.
 */
function AvisoProvider({ children }) {
  const [aviso, setAviso] = useState(null)

  const fechar = useCallback(() => setAviso(null), [])
  const mostrarSucesso = useCallback((texto) => {
    setAviso({ id: crypto.randomUUID(), texto })
  }, [])

  const valor = useMemo(() => ({ mostrarSucesso }), [mostrarSucesso])

  return (
    <AvisoContext.Provider value={valor}>
      {children}
      <div className="toast-container position-fixed top-0 end-0 p-3" role="status">
        {aviso && <ToastSucesso key={aviso.id} texto={aviso.texto} aoFechar={fechar} />}
      </div>
    </AvisoContext.Provider>
  )
}

export default AvisoProvider
