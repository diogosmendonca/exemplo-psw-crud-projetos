import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { ROTULO_PERFIL_USUARIO } from '@gerenciador-de-projetos/compartilhado'
import { Alerta, Carregando } from './design-system'
import { useAutenticacao } from './hooks/useAutenticacao.js'
import { useUsuarios } from './hooks/useUsuarios.js'

function AcoesUsuario({ usuario, proprio, expandida = false }) {
  const classeBotao = expandida
    ? 'btn flex-fill d-inline-flex align-items-center justify-content-center gap-2 py-3 ds-alvo-toque'
    : 'btn btn-sm'

  return (
    <div className={expandida ? 'd-flex gap-3' : 'btn-group'} role="group" aria-label="Ações do usuário">
      <Link
        className={`${classeBotao} btn-outline-primary ${proprio && !expandida ? 'rounded-end-0' : ''}`}
        to={`/usuarios/${usuario.id}`}
        aria-label={`Alterar usuário ${usuario.nome}`}
        title="Alterar usuário"
      >
        <Pencil aria-hidden="true" size={expandida ? 18 : 16} />
        {expandida && 'Alterar'}
      </Link>
      {proprio ? (
        <span
          className={expandida ? 'flex-fill d-flex' : 'd-inline-flex'}
          tabIndex={0}
          title="Você não pode excluir a própria conta."
          aria-label="Você não pode excluir a própria conta"
        >
          <button
            type="button"
            className={`${classeBotao} btn-outline-danger ${expandida ? 'flex-fill' : 'rounded-start-0'}`}
            disabled
            tabIndex={-1}
            aria-hidden="true"
          >
            <Trash2 aria-hidden="true" size={expandida ? 18 : 16} />
            {expandida && 'Excluir'}
          </button>
        </span>
      ) : (
        <Link
          className={`${classeBotao} btn-outline-danger`}
          to={`/usuarios/${usuario.id}/excluir`}
          aria-label={`Excluir usuário ${usuario.nome}`}
          title="Excluir usuário"
        >
          <Trash2 aria-hidden="true" size={expandida ? 18 : 16} />
          {expandida && 'Excluir'}
        </Link>
      )}
    </div>
  )
}

function ListaUsuarios() {
  const { usuario: autenticado } = useAutenticacao()
  const { usuarios, carregando, erro } = useUsuarios()

  return (
    <>
      <section>
        <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
          <h2 className="h4 mb-0">Usuários</h2>
          <Link
            className="btn btn-primary d-inline-flex align-items-center gap-2 ds-alvo-toque"
            to="/usuarios/novo"
          >
            <Plus aria-hidden="true" size={18} />
            Novo usuário
          </Link>
        </div>

        {carregando && <Carregando>Carregando usuários...</Carregando>}
        {erro && <Alerta>{erro}</Alerta>}
        {!carregando && !erro && usuarios.length === 0 && (
          <Alerta tipo="neutro">Nenhum usuário encontrado.</Alerta>
        )}
        {!carregando && !erro && usuarios.length > 0 && (
          <>
            <div className="d-lg-none vstack gap-3">
              {usuarios.map((usuario) => (
                <article className="card" key={usuario.id}>
                  <div className="card-body">
                    <h3 className="h5 card-title mb-1">{usuario.nome}</h3>
                    <p className="card-subtitle text-body-secondary mb-1">{usuario.email}</p>
                    <p className="mb-1">{usuario.nomeUsuario}</p>
                    <p className="mb-0">{ROTULO_PERFIL_USUARIO[usuario.perfil]}</p>
                  </div>
                  <div className="card-footer bg-transparent">
                    <AcoesUsuario usuario={usuario} proprio={usuario.id === autenticado?.id} expandida />
                  </div>
                </article>
              ))}
            </div>

            <div className="d-none d-lg-block table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Nome de usuário</th>
                    <th scope="col">Perfil</th>
                    <th scope="col">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.nome}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.nomeUsuario}</td>
                      <td>{ROTULO_PERFIL_USUARIO[usuario.perfil]}</td>
                      <td>
                        <AcoesUsuario usuario={usuario} proprio={usuario.id === autenticado?.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
      <Outlet />
    </>
  )
}

export default ListaUsuarios
