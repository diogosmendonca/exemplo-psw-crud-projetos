import { useEffect, useRef, useState } from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { FolderKanban, FolderPlus } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

// Itens do menu principal. Para adicionar uma página ao menu, inclua um item aqui.
const ITENS_MENU = [
  { para: '/projetos', rotulo: 'Projetos', Icone: FolderKanban, exato: true },
  { para: '/projetos/novo', rotulo: 'Novo projeto', Icone: FolderPlus, exato: false },
]

function Cabecalho() {
  const navRef = useRef(null)
  const [aberto, setAberto] = useState(false)
  const fecharMenu = () => setAberto(false)

  // No mobile o menu fecha ao interagir fora dele. O clique fora precisa de um
  // listener no documento porque nem todo navegador move o foco ao tocar.
  useEffect(() => {
    const aoInteragirFora = (event) => {
      if (!navRef.current?.contains(event.target)) setAberto(false)
    }

    document.addEventListener('pointerdown', aoInteragirFora)
    return () => document.removeEventListener('pointerdown', aoInteragirFora)
  }, [])

  // Também fecha quando o foco (teclado) sai do menu.
  const aoPerderFoco = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setAberto(false)
  }

  return (
    <Navbar
      ref={navRef}
      expand="lg"
      bg="primary"
      data-bs-theme="dark"
      aria-label="Navegação principal"
      expanded={aberto}
      onToggle={setAberto}
      onBlur={aoPerderFoco}
    >
      <Container>
        <Navbar.Brand as={Link} to="/projetos" onClick={fecharMenu}>
          Sistema de Gerenciamento de Projetos
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="menu-principal"
          aria-expanded={aberto}
          label="Alternar navegação"
        />
        <Navbar.Collapse id="menu-principal">
          <Nav className="ms-auto">
            {ITENS_MENU.map(({ para, rotulo, Icone, exato }) => (
              <Nav.Link
                key={para}
                as={NavLink}
                to={para}
                end={exato}
                className="d-flex align-items-center gap-2"
                onClick={fecharMenu}
              >
                <Icone aria-hidden="true" size={18} />
                {rotulo}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Cabecalho
