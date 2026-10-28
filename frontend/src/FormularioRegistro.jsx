import { zodResolver } from '@hookform/resolvers/zod'
import { ROTULO_PERFIL_USUARIO } from '@gerenciador-de-projetos/compartilhado'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { registrarGerente } from './api/usuarios.js'
import { useAviso } from './aviso/contexto.js'
import { Alerta, CampoFormulario, TituloPagina } from './design-system'
import { schemaFormularioRegistro } from './schemas/usuarioSchema.js'

function FormularioRegistro() {
  const navigate = useNavigate()
  const { mostrarSucesso } = useAviso()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { nome: '', email: '', nomeUsuario: '', senha: '', confirmarSenha: '' },
    resolver: zodResolver(schemaFormularioRegistro),
  })

  const submeter = async ({ confirmarSenha: _confirmacao, ...dados }) => {
    try {
      const usuario = await registrarGerente(dados)
      mostrarSucesso(`A conta de ${usuario.nome} foi criada. Entre com o nome de usuário e a senha.`)
      navigate('/entrar')
    } catch (erroDaSubmissao) {
      const destino = erroDaSubmissao.campo ?? 'root.serverError'
      setError(destino, { type: 'server', message: erroDaSubmissao.message })
    }
  }

  return (
    <main className="container py-4">
      <section className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <TituloPagina>Registrar</TituloPagina>
          <p className="text-body-secondary">
            Este registro cria um usuário {ROTULO_PERFIL_USUARIO.gerente}.
          </p>
          <form onSubmit={handleSubmit(submeter)} noValidate>
            <CampoFormulario
              id="nome-registro"
              rotulo="Nome"
              autoComplete="name"
              erro={errors.nome}
              {...register('nome')}
            />
            <CampoFormulario
              id="email-registro"
              rotulo="E-mail"
              type="email"
              autoComplete="email"
              erro={errors.email}
              {...register('email')}
            />
            <CampoFormulario
              id="nome-de-usuario-registro"
              rotulo="Nome de usuário"
              autoComplete="username"
              ajuda="Usado para entrar no sistema. Não diferencia maiúsculas de minúsculas."
              erro={errors.nomeUsuario}
              {...register('nomeUsuario')}
            />
            <CampoFormulario
              id="senha-registro"
              rotulo="Senha"
              type="password"
              autoComplete="new-password"
              ajuda="De 8 a 72 caracteres."
              erro={errors.senha}
              {...register('senha')}
            />
            <CampoFormulario
              id="confirmar-senha-registro"
              rotulo="Confirmar senha"
              type="password"
              autoComplete="new-password"
              erro={errors.confirmarSenha}
              {...register('confirmarSenha')}
            />

            {errors.root?.serverError && <Alerta>{errors.root.serverError.message}</Alerta>}
            <button className="btn btn-primary ds-alvo-toque" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar'}
            </button>
          </form>
          <p className="mt-4 mb-0">
            Já tem uma conta? <Link to="/entrar">Entrar</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default FormularioRegistro
