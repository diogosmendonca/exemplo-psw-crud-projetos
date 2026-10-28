import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { useAviso } from './aviso/contexto.js'
import { Alerta, Carregando } from './design-system'
import { useMutacoesUsuarios, useUsuario } from './hooks/useUsuarios.js'

function ConfirmacaoExclusaoUsuario() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { mostrarSucesso } = useAviso()
  const { usuario, carregando, erro: erroDaBusca } = useUsuario(id)
  const { excluirUsuario } = useMutacoesUsuarios()
  const [visivel, setVisivel] = useState(true)
  const [erro, setErro] = useState('')
  const [excluindo, setExcluindo] = useState(false)

  const fechar = () => setVisivel(false)

  const confirmarExclusao = async () => {
    setErro('')
    setExcluindo(true)

    try {
      await excluirUsuario(id)
      mostrarSucesso(
        usuario?.nome ? `${usuario.nome} foi excluído com sucesso.` : 'Usuário excluído com sucesso.',
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
      onExited={() => navigate('/usuarios', { replace: true })}
      aria-labelledby="titulo-exclusao-usuario"
      centered
    >
      <Modal.Header closeButton closeLabel="Fechar">
        <Modal.Title as="h2" className="h5" id="titulo-exclusao-usuario">
          Excluir usuário
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {carregando && <Carregando>Carregando usuário...</Carregando>}
        {erroDaBusca && <Alerta className="mb-0">{erroDaBusca}</Alerta>}
        {!carregando && !erroDaBusca && !usuario && (
          <Alerta className="mb-0">Usuário não encontrado.</Alerta>
        )}
        {usuario && (
          <p className="mb-0">
            Deseja excluir o usuário <strong>{usuario.nome}</strong>?
          </p>
        )}
        {erro && <Alerta className="mt-3 mb-0">{erro}</Alerta>}
      </Modal.Body>
      <Modal.Footer className="justify-content-start">
        <Button variant="danger" onClick={confirmarExclusao} disabled={!usuario || excluindo}>
          {excluindo ? 'Excluindo...' : 'Excluir usuário'}
        </Button>
        <Button variant="outline-secondary" onClick={fechar}>
          Voltar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ConfirmacaoExclusaoUsuario
