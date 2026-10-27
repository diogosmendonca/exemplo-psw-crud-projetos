import { zodResolver } from '@hookform/resolvers/zod'
import { PERFIS_USUARIO, ROTULO_PERFIL_USUARIO } from '@gerenciador-de-projetos/compartilhado'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { cadastrarUsuario } from './api/usuarios.js'
import { useAviso } from './aviso/contexto.js'
import { Alerta, CampoFormulario, TituloPagina } from './design-system'
import schemaUsuario from './schemas/usuarioSchema.js'

const estadoInicial = {
  nome: '',
  email: '',
  nomeUsuario: '',
  senha: '',
  confirmarSenha: '',
  perfil: '',
}

function FormularioUsuario() {
  const navigate = useNavigate()
  const { mostrarSucesso } = useAviso()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: estadoInicial,
    resolver: zodResolver(schemaUsuario),
  })

  const submeter = async (dados) => {
    try {
      // `confirmarSenha` só existe na tela; o schema da API descarta o campo.
      const usuario = await cadastrarUsuario(dados)
      reset(estadoInicial)
      mostrarSucesso(`O usuário ${usuario.nome} foi cadastrado com sucesso.`)
    } catch (erroDaSubmissao) {
      const destino = erroDaSubmissao.campo ?? 'root.serverError'
      setError(destino, { type: 'server', message: erroDaSubmissao.message })
    }
  }

  return (
    <section className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <TituloPagina>Cadastrar usuário</TituloPagina>
        <form onSubmit={handleSubmit(submeter)} noValidate>
          <CampoFormulario
            id="nome-usuario"
            rotulo="Nome"
            autoComplete="name"
            erro={errors.nome}
            {...register('nome')}
          />

          <CampoFormulario
            id="email-usuario"
            rotulo="E-mail"
            type="email"
            autoComplete="email"
            erro={errors.email}
            {...register('email')}
          />

          <CampoFormulario
            id="nome-de-usuario"
            rotulo="Nome de usuário"
            autoComplete="username"
            ajuda="Usado para entrar no sistema. Não diferencia maiúsculas de minúsculas."
            erro={errors.nomeUsuario}
            {...register('nomeUsuario')}
          />

          <CampoFormulario
            id="senha-usuario"
            rotulo="Senha"
            type="password"
            autoComplete="new-password"
            ajuda="De 8 a 72 caracteres. Ela não é gravada em texto."
            erro={errors.senha}
            {...register('senha')}
          />

          <CampoFormulario
            id="confirmar-senha-usuario"
            rotulo="Confirmar senha"
            type="password"
            autoComplete="new-password"
            erro={errors.confirmarSenha}
            {...register('confirmarSenha')}
          />

          <CampoFormulario
            id="perfil-usuario"
            rotulo="Perfil de acesso"
            tipo="select"
            erro={errors.perfil}
            {...register('perfil')}
          >
            <option value="">Selecione</option>
            {PERFIS_USUARIO.map((perfil) => (
              <option key={perfil} value={perfil}>
                {ROTULO_PERFIL_USUARIO[perfil]}
              </option>
            ))}
          </CampoFormulario>

          {errors.root?.serverError && <Alerta>{errors.root.serverError.message}</Alerta>}
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary ds-alvo-toque" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Cadastrar usuário'}
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

export default FormularioUsuario
