import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { schemaLogin } from '@gerenciador-de-projetos/compartilhado'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { entrar } from './api/token.js'
import { Alerta, CampoFormulario, Carregando, TituloPagina } from './design-system'
import { autenticacaoQueryKey, useAutenticacao } from './hooks/useAutenticacao.js'

function FormularioLogin() {
  const { usuario, carregando, erro } = useAutenticacao()

  if (carregando) return <Carregando>Carregando...</Carregando>
  if (erro) return <Alerta>{erro}</Alerta>
  if (usuario) return <Navigate to="/projetos" replace />

  return <CamposLogin />
}

function CamposLogin() {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { nomeUsuario: '', senha: '' },
    resolver: zodResolver(schemaLogin),
  })

  const submeter = async (credenciais) => {
    try {
      const usuario = await entrar(credenciais)
      queryClient.setQueryData(autenticacaoQueryKey, usuario)
    } catch (erroDaSubmissao) {
      setError('root.serverError', { type: 'server', message: erroDaSubmissao.message })
    }
  }

  return (
    <section className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-5">
        <TituloPagina>Entrar</TituloPagina>
        <form onSubmit={handleSubmit(submeter)} noValidate>
          <CampoFormulario
            id="nome-de-usuario-login"
            rotulo="Nome de usuário"
            autoComplete="username"
            erro={errors.nomeUsuario}
            {...register('nomeUsuario')}
          />

          <CampoFormulario
            id="senha-login"
            rotulo="Senha"
            type="password"
            autoComplete="current-password"
            erro={errors.senha}
            {...register('senha')}
          />

          {errors.root?.serverError && <Alerta>{errors.root.serverError.message}</Alerta>}
          <button className="btn btn-primary ds-alvo-toque" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default FormularioLogin
