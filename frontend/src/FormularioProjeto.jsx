import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useAviso } from './aviso/contexto.js'
import { Alerta, CampoFormulario, Carregando, TituloPagina } from './design-system'
import { useAutenticacao } from './hooks/useAutenticacao.js'
import { useClientes } from './hooks/useClientes.js'
import { useMutacoesProjetos, useProjeto } from './hooks/useProjetos.js'
import { useGerentes } from './hooks/useUsuarios.js'
import schemaProjeto, { NOVO_CLIENTE } from './schemas/projetoSchema.js'

const estadoInicial = {
  nome: '',
  status: 'ativo',
  cliente: '',
  novoCliente: '',
  descricao: '',
  tecnologias: '',
  url: '',
  gerenteId: '',
}

function dadosDoProjeto(projeto) {
  return {
    nome: projeto.nome ?? projeto.name ?? '',
    status: projeto.status ?? '',
    cliente: projeto.cliente?.nome ?? '',
    novoCliente: '',
    descricao: projeto.descricao ?? '',
    tecnologias: Array.isArray(projeto.tecnologias)
      ? projeto.tecnologias.join(', ')
      : projeto.tecnologias ?? '',
    url: projeto.url ?? '',
    gerenteId: projeto.gerente?.id ?? '',
  }
}

function FormularioProjeto() {
  const { id } = useParams()
  const { usuario } = useAutenticacao()
  const { projeto, carregando, erro } = useProjeto(id)
  const { criarProjeto, atualizarProjeto } = useMutacoesProjetos()
  const editando = Boolean(id)
  const ehGerente = usuario?.perfil === 'gerente'

  if (editando && carregando) return <Carregando>Carregando projeto...</Carregando>

  if (editando && erro) return <Alerta>{erro}</Alerta>

  if (editando && !projeto) return <Alerta>Projeto não encontrado.</Alerta>

  const dadosIniciais = projeto
    ? dadosDoProjeto(projeto)
    : { ...estadoInicial, gerenteId: ehGerente ? usuario.id : '' }

  return (
    <CamposFormulario
      key={id ?? 'novo'}
      id={id}
      editando={editando}
      dadosIniciais={dadosIniciais}
      gerenteAtual={projeto?.gerente ?? null}
      usuario={usuario}
      criarProjeto={criarProjeto}
      atualizarProjeto={atualizarProjeto}
    />
  )
}

function CamposFormulario({
  id,
  editando,
  dadosIniciais,
  gerenteAtual,
  usuario,
  criarProjeto,
  atualizarProjeto,
}) {
  const navigate = useNavigate()
  const { mostrarSucesso } = useAviso()
  const { clientes } = useClientes()
  const ehGerente = usuario?.perfil === 'gerente'
  const { gerentes, erro: erroDosGerentes } = useGerentes(!ehGerente)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: dadosIniciais,
    resolver: zodResolver(schemaProjeto),
  })

  // O cliente atual entra na lista mesmo que ela ainda não tenha carregado:
  // um select só mostra o valor inicial se a opção já existir quando ele aparece.
  const nomesDeClientes = [
    ...new Set([dadosIniciais.cliente, ...clientes.map((cliente) => cliente.nome)].filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, 'pt', { sensitivity: 'base' }))
  const opcoesDeGerente = [...gerentes]
  if (gerenteAtual && !opcoesDeGerente.some((gerente) => gerente.id === gerenteAtual.id)) {
    opcoesDeGerente.unshift(gerenteAtual)
  }
  const cadastrandoCliente = useWatch({ control, name: 'cliente' }) === NOVO_CLIENTE

  const submeter = async ({ novoCliente, ...dados }) => {
    // A API identifica o cliente pelo nome e o cria se for novo. Vazio = sem cliente.
    const nomeDoCliente = dados.cliente === NOVO_CLIENTE ? novoCliente : dados.cliente

    const dadosParaEnviar = {
      ...dados,
      cliente: nomeDoCliente ? { nome: nomeDoCliente } : null,
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

          {ehGerente ? (
            <>
              <input type="hidden" {...register('gerenteId')} />
              <CampoFormulario
                id="gerente-projeto"
                rotulo="Gerente"
                value={usuario.nome}
                readOnly
                ajuda="O projeto fica associado a você."
              />
            </>
          ) : (
            <CampoFormulario
              id="gerente-projeto"
              rotulo="Gerente"
              tipo="select"
              erro={errors.gerenteId}
              ajuda="O gerente é quem vê e altera este projeto."
              {...register('gerenteId')}
            >
              <option value="">Selecione</option>
              {opcoesDeGerente.map((gerente) => (
                <option key={gerente.id} value={gerente.id}>
                  {gerente.nome}
                </option>
              ))}
            </CampoFormulario>
          )}

          {erroDosGerentes && <Alerta>{erroDosGerentes}</Alerta>}

          <CampoFormulario
            id="cliente-projeto"
            rotulo="Cliente"
            tipo="select"
            erro={errors.cliente}
            {...register('cliente')}
          >
            <option value="">Sem cliente</option>
            {nomesDeClientes.map((nome) => (
              <option key={nome} value={nome}>
                {nome}
              </option>
            ))}
            <option value={NOVO_CLIENTE}>+ Novo cliente…</option>
          </CampoFormulario>

          {cadastrandoCliente && (
            <CampoFormulario
              id="novo-cliente-projeto"
              rotulo="Nome do novo cliente"
              ajuda="O cliente é cadastrado ao salvar o projeto e passa a aparecer na lista."
              erro={errors.novoCliente}
              autoFocus
              {...register('novoCliente')}
            />
          )}

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