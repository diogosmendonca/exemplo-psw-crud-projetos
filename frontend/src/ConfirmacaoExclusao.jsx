import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useAviso } from './aviso/contexto.js'
import { Alerta, Carregando } from './design-system'
import { useMutacoesProjetos, useProjeto } from './hooks/useProjetos.js'

/**
 * Modal de confirmação de exclusão. É rota filha de `Lista`
 * (`/projetos/:id/excluir`) e aparece sobre a lista, que continua montada.
 * Ao terminar de fechar (`onExited`), volta para `/projetos`.
 */
function ConfirmacaoExclusao() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { mostrarSucesso } = useAviso()
  const { projeto, carregando, erro: erroDaBusca } = useProjeto(id)
  const { excluirProjeto } = useMutacoesProjetos()
  const [visivel, setVisivel] = useState(true)
  const [erro, setErro] = useState('')
  const [excluindo, setExcluindo] = useState(false)
  const nome = projeto?.nome ?? projeto?.name

  const fechar = () => setVisivel(false)

  const confirmarExclusao = async () => {
    setErro('')
    setExcluindo(true)

    try {
      await excluirProjeto(id)
      mostrarSucesso(
        nome ? `${nome} foi excluído com sucesso.` : 'Projeto excluído com sucesso.',
      )
      fechar()
    } catch (erroDaExclusao) {
      setErro(erroDaExclusao.message)
      setExcluindo(false)
    }
  }

  return (
    <Modal
      show={visivel}
      onHide={fechar}
      onExited={() => navigate('/projetos', { replace: true })}
      aria-labelledby="titulo-exclusao"
      centered
    >
      <Modal.Header closeButton closeLabel="Fechar">
        <Modal.Title as="h2" className="h5" id="titulo-exclusao">
          Excluir projeto
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {carregando && <Carregando>Carregando projeto...</Carregando>}
        {erroDaBusca && <Alerta className="mb-0">{erroDaBusca}</Alerta>}
        {!carregando && !erroDaBusca && !projeto && (
          <Alerta className="mb-0">Projeto não encontrado.</Alerta>
        )}
        {projeto && (
          <p className="mb-0">
            Deseja excluir o projeto <strong>{nome}</strong>?
          </p>
        )}
        {erro && <Alerta className="mt-3 mb-0">{erro}</Alerta>}
      </Modal.Body>
      {/* Padrão do sistema: ação principal à esquerda, secundária à direita. */}
      <Modal.Footer className="justify-content-start">
        <Button variant="danger" onClick={confirmarExclusao} disabled={!projeto || excluindo}>
          {excluindo ? 'Excluindo...' : 'Excluir projeto'}
        </Button>
        <Button variant="outline-secondary" onClick={fechar}>
          Voltar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmacaoExclusao
