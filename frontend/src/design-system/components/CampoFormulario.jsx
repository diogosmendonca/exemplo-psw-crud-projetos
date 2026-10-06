/**
 * Campo de formulário completo: rótulo + controle + mensagem de erro.
 * Cuida de classes Bootstrap, estado inválido e acessibilidade
 * (`aria-invalid`, `aria-describedby`).
 *
 * Compatível com react-hook-form: passe `{...register('campo')}` como props.
 *
 * @param {object} props
 * @param {string} props.id Id único do controle (liga o rótulo ao campo).
 * @param {string} props.rotulo Texto do rótulo.
 * @param {{ message?: string }} [props.erro] Objeto de erro do react-hook-form
 *   (`errors.campo`). Quando presente, o campo fica inválido e a mensagem aparece.
 * @param {'texto'|'select'|'textarea'} [props.tipo='texto'] Tipo de controle.
 *   Para `select`, passe as `<option>` como `children`.
 * @param {...*} props.rest Demais props vão direto ao controle
 *   (`type`, `rows`, `onChange`, `ref`, ...).
 *
 * @example
 * <CampoFormulario id="nome-projeto" rotulo="Nome" erro={errors.nome} {...register('nome')} />
 *
 * <CampoFormulario id="status-projeto" rotulo="Estado" tipo="select" erro={errors.status} {...register('status')}>
 *   <option value="ativo">Ativo</option>
 * </CampoFormulario>
 */
function CampoFormulario({ id, rotulo, erro, tipo = 'texto', children, ...controle }) {
  const idErro = erro ? `erro-${id}` : undefined
  const Elemento = tipo === 'select' ? 'select' : tipo === 'textarea' ? 'textarea' : 'input'
  const classeBase = tipo === 'select' ? 'form-select' : 'form-control'

  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>
        {rotulo}
      </label>
      <Elemento
        id={id}
        className={`${classeBase} ${erro ? 'is-invalid' : ''}`.trim()}
        aria-invalid={Boolean(erro)}
        aria-describedby={idErro}
        {...(tipo === 'textarea' ? { rows: 4 } : {})}
        {...controle}
      >
        {children}
      </Elemento>
      {erro && (
        <div id={idErro} className="invalid-feedback">
          {erro.message}
        </div>
      )}
    </div>
  )
}

export default CampoFormulario
