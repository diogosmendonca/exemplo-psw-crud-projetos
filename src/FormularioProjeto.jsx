import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useAviso } from './aviso/contexto.js'
import { Alerta, CampoFormulario, Carregando, TituloPagina } from './design-system'
import { useProjetos } from './hooks/useProjetos.js'
import schemaProjeto from './schemas/projetoSchema.js'

const estadoInicial = {
  nome: '',
  status: 'ativo',
  descricao: '',
  tecnologias: '',
  url: '',
}

function dadosDoProjeto(projeto) {
  return {
    nome: projeto.nome ?? projeto.name ?? '',
    status: projeto.status ?? '',
    descricao: projeto.descricao ?? '',
    tecnologias: Array.isArray(projeto.tecnologias)
      ? projeto.tecnologias.join(', ')
      : projeto.tecnologias ?? '',
    url: projeto.url ?? '',
  }
}

function FormularioProjeto() {
  const { id } = useParams()
  const { projetos, carregando, criarProjeto, atualizarProjeto } = useProjetos()
  const editando = Boolean(id)
  const projeto = projetos.find((item) => String(item.id) === String(id))

  if (editando && carregando) return <Carregando>Carregando projeto...</Carregando>

  if (editando && !projeto) return <Alerta>Projeto não encontrado.</Alerta>

  return (
    <CamposFormulario
      key={id ?? 'novo'}
      id={id}
      editando={editando}
      dadosIniciais={projeto ? dadosDoProjeto(projeto) : estadoInicial}
      criarProjeto={criarProjeto}
      atualizarProjeto={atualizarProjeto}
    />
  )
}

function CamposFormulario({
  id,
  editando,
  dadosIniciais,
  criarProjeto,
  atualizarProjeto,
}) {
  const navigate = useNavigate()
  const { mostrarSucesso } = useAviso()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: dadosIniciais,
    resolver: zodResolver(schemaProjeto),
  })

  const submeter = async (dados) => {
    const dadosParaEnviar = {
      ...dados,
      tecnologias: dados.tecnologias
        .split(',')
        .map((tecnologia) => tecnologia.trim())
        .filter(Boolean),
    }

    try {
      if (editando) {
        await atualizarProjeto(id, dadosParaEnviar)
      } else {
        await criarProjeto(dadosParaEnviar)
      }

      mostrarSucesso(
        editando
          ? `${dados.nome} foi alterado com sucesso.`
          : `${dados.nome} foi incluído com sucesso.`,
      )
      navigate('/projetos')
    } catch (erroDaSubmissao) {
      setError('root.serverError', {
        type: 'server',
        message: erroDaSubmissao.message,
      })
    }
  }

  return (
    <section className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <TituloPagina>{editando ? 'Alterar projeto' : 'Novo projeto'}</TituloPagina>
        <form onSubmit={handleSubmit(submeter)} noValidate>
          <CampoFormulario
            id="nome-projeto"
            rotulo="Nome"
            erro={errors.nome}
            {...register('nome')}
          />

          <CampoFormulario
            id="status-projeto"
            rotulo="Estado"
            tipo="select"
            erro={errors.status}
            {...register('status')}
          >
            <option value="">Selecione</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </CampoFormulario>

          <CampoFormulario
            id="descricao-projeto"
            rotulo="Descrição"
            tipo="textarea"
            erro={errors.descricao}
            {...register('descricao')}
          />

          <CampoFormulario
            id="tecnologias-projeto"
            rotulo="Tecnologias"
            erro={errors.tecnologias}
            {...register('tecnologias')}
          />

          <CampoFormulario
            id="url-projeto"
            rotulo="URL"
            type="url"
            erro={errors.url}
            {...register('url')}
          />

          {errors.root?.serverError && <Alerta>{errors.root.serverError.message}</Alerta>}
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary ds-alvo-toque" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar projeto'}
            </button>
            <button
              className="btn btn-outline-secondary ds-alvo-toque"
              type="button"
              onClick={() => navigate('/projetos')}
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default FormularioProjeto