import { useEffect, useRef } from 'react'
import { Collapse } from 'bootstrap'
import { FolderKanban, FolderPlus } from 'lucide-react'
import { NavLink } from 'react-router-dom'

// Itens do menu principal. Para adicionar uma página ao menu, inclua um item aqui.
const ITENS_MENU = [
  { para: '/projetos', rotulo: 'Projetos', Icone: FolderKanban, exato: true },
  { para: '/projetos/novo', rotulo: 'Novo projeto', Icone: FolderPlus, exato: false },
]

function Cabecalho() {
  const navRef = useRef(null)
  const menuRef = useRef(null)

  const fecharMenu = () => {
    const menu = menuRef.current
    if (!menu?.classList.contains('show')) return

    Collapse.getOrCreateInstance(menu, { toggle: false }).hide()
  }

  useEffect(() => {
    const nav = navRef.current

    const aoPerderFoco = (event) => {
      if (event.relatedTarget && nav.contains(event.relatedTarget)) return

      fecharMenu()
    }

    const aoInteragirFora = (event) => {
      if (nav.contains(event.target)) return

      fecharMenu()
    }

    nav.addEventListener('focusout', aoPerderFoco)
    document.addEventListener('pointerdown', aoInteragirFora)

    return () => {
      nav.removeEventListener('focusout', aoPerderFoco)
      document.removeEventListener('pointerdown', aoInteragirFora)
    }
  }, [])

  return (
    <nav
      ref={navRef}
      className="navbar navbar-expand-lg bg-primary"
      data-bs-theme="dark"
      aria-label="Navegação principal"
    >
      <div className="container">
        <NavLink className="navbar-brand" to="/projetos" onClick={fecharMenu}>
          Sistema de Gerenciamento de Projetos
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menu-principal"
          aria-controls="menu-principal"
          aria-expanded="false"
          aria-label="Alternar navegação"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div ref={menuRef} className="collapse navbar-collapse" id="menu-principal">
          <ul className="navbar-nav ms-auto">
            {ITENS_MENU.map(({ para, rotulo, Icone, exato }) => (
              <li className="nav-item" key={para}>
                <NavLink
                  className="nav-link d-flex align-items-center gap-2"
                  to={para}
                  end={exato}
                  onClick={fecharMenu}
                >
                  <Icone aria-hidden="true" size={18} />
                  {rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Cabecalho
