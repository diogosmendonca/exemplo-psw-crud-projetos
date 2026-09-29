import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { Alerta, Carregando, StatusBadge } from './design-system'
import { useProjetos } from './hooks/useProjetos.js'

function nomeDoProjeto(projeto) {
  return projeto.nome ?? projeto.name
}

function AcoesProjeto({ projeto, expandida = false }) {
  const nome = nomeDoProjeto(projeto)
  const classeBotao = expandida
    ? 'btn flex-fill d-inline-flex align-items-center justify-content-center gap-2 py-3 ds-alvo-toque'
    : 'btn btn-sm'

  return (
    <div
      className={expandida ? 'd-flex gap-3' : 'btn-group'}
      role="group"
      aria-label="Ações do projeto"
    >
      <Link
        className={`${classeBotao} btn-outline-primary`}
        to={`/projetos/${projeto.id}`}
        aria-label={`Alterar projeto ${nome}`}
        title="Alterar projeto"
      >
        <Pencil aria-hidden="true" size={expandida ? 18 : 16} />
        {expandida && 'Alterar'}
      </Link>
      <Link
        className={`${classeBotao} btn-outline-danger`}
        to={`/projetos/${projeto.id}/excluir`}
        aria-label={`Excluir projeto ${nome}`}
        title="Excluir projeto"
      >
        <Trash2 aria-hidden="true" size={expandida ? 18 : 16} />
        {expandida && 'Excluir'}
      </Link>
    </div>
  )
}

function Lista() {
  const { projetos, carregando, erro } = useProjetos()
  const [filtro, setFiltro] = useState('todos')

  const projetosFiltrados = projetos.filter((projeto) => {
    if (filtro === 'todos') return true

    return filtro === 'ativos'
      ? projeto.status === 'ativo'
      : projeto.status === 'inativo'
  })

  return (
    <>
      <section>
        <div className="row g-3 align-items-end justify-content-between mb-3">
          <div className="col-12 col-md-4">
            <label htmlFor="filtro-projetos" className="form-label">
              Filtrar projetos
            </label>
            <select
              id="filtro-projetos"
              className="form-select"
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </div>
          <div className="col-12 col-md-auto">
            <Link
              className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2 ds-alvo-toque"
              to="/projetos/novo"
            >
              <Plus aria-hidden="true" size={18} />
              Novo projeto
            </Link>
          </div>
        </div>

        {carregando && <Carregando>Carregando projetos...</Carregando>}
        {erro && <Alerta>Não foi possível carregar os projetos.</Alerta>}
        {!carregando && !erro && projetosFiltrados.length === 0 && (
          <Alerta tipo="neutro">Nenhum projeto encontrado.</Alerta>
        )}
        {!carregando && !erro && projetosFiltrados.length > 0 && (
          <>
            <div className="d-lg-none vstack gap-3">
              {projetosFiltrados.map((projeto) => (
                <article className="card" key={projeto.id}>
                  <div className="card-body d-flex justify-content-between align-items-start gap-3">
                    <h3 className="h5 card-title mb-0">{nomeDoProjeto(projeto)}</h3>
                    <StatusBadge status={projeto.status} />
                  </div>
                  <div className="card-footer bg-transparent">
                    <AcoesProjeto projeto={projeto} expandida />
                  </div>
                </article>
              ))}
            </div>

            <div className="d-none d-lg-block table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th scope="col">Projeto</th>
                    <th scope="col">Status</th>
                    <th scope="col">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {projetosFiltrados.map((projeto) => (
                    <tr key={projeto.id}>
                      <td>{nomeDoProjeto(projeto)}</td>
                      <td>
                        <StatusBadge status={projeto.status} />
                      </td>
                      <td>
                        <AcoesProjeto projeto={projeto} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Rotas filhas (ex.: modal de exclusão) aparecem sobre a lista. */}
      <Outlet />
    </>
  )
}

export default Lista
