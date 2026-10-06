/**
 * Título principal de uma tela (heading nível 2; o nível 1 é o nome do
 * sistema na navbar).
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 *
 * @example
 * <TituloPagina>Novo projeto</TituloPagina>
 */
function TituloPagina({ children }) {
  return <h2 className="h3 mb-4">{children}</h2>
}

export default TituloPagina
