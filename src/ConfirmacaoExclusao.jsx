import { useEffect, useRef, useState } from 'react'
import { Modal } from 'bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useAviso } from './aviso/contexto.js'
import { Alerta, Carregando } from './design-system'
import { useProjetos } from './hooks/useProjetos.js'

/**
 * Modal de confirmação de exclusão. É rota filha de `Lista`
 * (`/projetos/:id/excluir`) e aparece sobre a lista, que continua montada.
 */
function ConfirmacaoExclusao() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { mostrarSucesso } = useAviso()
  const modalRef = useRef(null)
  const { projetos, carregando, excluirProjeto } = useProjetos()
  const [erro, setErro] = useState('')
  const [excluindo, setExcluindo] = useState(false)
  // Guardado quando a exclusão começa: após a lista ser recarregada o projeto
  // deixa de existir, mas o modal ainda o exibe durante a animação de fechar.
  const [emExclusao, setEmExclusao] = useState(null)
  const projeto =
    projetos.find((item) => String(item.id) === String(id)) ?? emExclusao
  const nome = projeto?.nome ?? projeto?.name

  useEffect(() => {
    const element = modalRef.current
    const modal = new Modal(element)
    let ativo = true

    const limparRestos = () => {
      document.body.classList.remove('modal-open')
      document.body.style.removeProperty('overflow')
      document.body.style.removeProperty('padding-right')
      document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())
      document.body.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === 'null') {
          node.remove()
        }
      })
    }

    const aoFechar = () => {
      if (ativo) navigate('/projetos', { replace: true })
    }

    element.addEventListener('hidden.bs.modal', aoFechar)
    limparRestos()

    const quadro = requestAnimationFrame(() => {
      if (ativo) modal.show()
    })

    return () => {
      ativo = false
      cancelAnimationFrame(quadro)
      element.removeEventListener('hidden.bs.modal', aoFechar)
      modal.dispose()
      limparRestos()
    }
  }, [navigate])

  const confirmarExclusao = async () => {
    setErro('')
    setExcluindo(true)
    setEmExclusao(projeto)

    try {
      await excluirProjeto(id)
      mostrarSucesso(
        nome ? `${nome} foi excluído com sucesso.` : 'Projeto excluído com sucesso.',
      )
      Modal.getInstance(modalRef.current)?.hide()
    } catch (erroDaExclusao) {
      setErro(erroDaExclusao.message)
      setExcluindo(false)
      setEmExclusao(null)
    }
  }

  return (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-exclusao"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title h5" id="titulo-exclusao">Excluir projeto</h2>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
          </div>
          <div className="modal-body">
            {carregando && <Carregando>Carregando projeto...</Carregando>}
            {!carregando && !projeto && (
              <Alerta className="mb-0">Projeto não encontrado.</Alerta>
            )}
            {projeto && (
              <p className="mb-0">
                Deseja excluir o projeto <strong>{nome}</strong>?
              </p>
            )}
            {erro && <Alerta className="mt-3 mb-0">{erro}</Alerta>}
          </div>
          {/* Padrão do sistema: ação principal à esquerda, secundária à direita. */}
          <div className="modal-footer justify-content-start">
            <button
              type="button"
              className="btn btn-danger"
              onClick={confirmarExclusao}
              disabled={carregando || !projeto || excluindo}
            >
              {excluindo ? 'Excluindo...' : 'Excluir projeto'}
            </button>
            <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmacaoExclusao
