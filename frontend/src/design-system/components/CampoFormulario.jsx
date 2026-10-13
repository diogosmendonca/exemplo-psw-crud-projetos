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
 * @param {string} [props.ajuda] Texto de apoio abaixo do campo (`form-text`).
 * @param {string[]} [props.sugestoes] Valores sugeridos para um campo de texto,
 *   num `<datalist>` (o recurso de lista de sugestões que o Bootstrap documenta
 *   em "Datalists"). Ao digitar, o navegador filtra a lista; o campo continua
 *   aceitando qualquer texto, inclusive um valor que não está nela.
 * @param {...*} props.rest Demais props vão direto ao controle
 *   (`type`, `rows`, `onChange`, `ref`, ...).
 *
 * @example
 * <CampoFormulario id="nome-projeto" rotulo="Nome" erro={errors.nome} {...register('nome')} />
 *
 * <CampoFormulario id="status-projeto" rotulo="Estado" tipo="select" erro={errors.status} {...register('status')}>
 *   <option value="ativo">Ativo</option>
 * </CampoFormulario>
 *
 * <CampoFormulario id="cliente-projeto" rotulo="Cliente" sugestoes={['Acme', 'Globex']} {...register('cliente')} />
 */
function CampoFormulario({
  id,
  rotulo,
  erro,
  ajuda,
  sugestoes,
  tipo = 'texto',
  children,
  ...controle
}) {
  const idErro = erro ? `erro-${id}` : undefined
  const idAjuda = ajuda ? `ajuda-${id}` : undefined
  const idSugestoes = sugestoes ? `sugestoes-${id}` : undefined
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
        aria-describedby={[idErro, idAjuda].filter(Boolean).join(' ') || undefined}
        {...(idSugestoes ? { list: idSugestoes, autoComplete: 'off' } : {})}
        {...(tipo === 'textarea' ? { rows: 4 } : {})}
        {...controle}
      >
        {children}
      </Elemento>
      {idSugestoes && (
        <datalist id={idSugestoes}>
          {sugestoes.map((sugestao) => (
            <option key={sugestao} value={sugestao} />
          ))}
        </datalist>
      )}
      {erro && (
        <div id={idErro} className="invalid-feedback">
          {erro.message}
        </div>
      )}
      {ajuda && (
        <div id={idAjuda} className="form-text">
          {ajuda}
        </div>
      )}
    </div>
  )
}

export default CampoFormulario
