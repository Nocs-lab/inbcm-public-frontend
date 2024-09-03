import React from "react"
import { useNavigate } from "react-router-dom"
import logoIbramSimples from "../images/logo-ibram-simples.png"
import useStore from "../utils/store"
import { useState } from "react"

const Header: React.FC = () => {
  const { setUser, ...rest } = useStore()
  const user = rest.user!
  const navigate = useNavigate()

  const logout = () => {
    setUser(null)
    navigate("/login")
  }

  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="br-header compact large fixed">
      <div className="container-lg">
        <div className="header-top">
          <div className="header-logo">
            <img src={logoIbramSimples} alt="logo" />
          </div>
          <div className="header-actions">
            <div className="header-login">
              <div>
                <button
                  className="br-sign-in p-0"
                  type="button"
                  id="avatar-dropdown-trigger"
                  data-testid="avatar-dropdown-trigger"
                  onClick={() => setUserMenuOpen((old) => !old)}
                  data-toggle="dropdown"
                  data-target="avatar-menu"
                >
                  <span className="br-avatar" title={user.name}>
                    <span className="content bg-orange-vivid-30 text-pure-0">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </span>
                  <span
                    className="ml-2 mr-1 text-gray-80 text-weight-regular"
                    data-testid="username"
                  >
                    <span className="text-weight-semi-bold">
                      {user.name.split(" ")[0]}
                    </span>
                  </span>
                  <i className="fas fa-caret-down" aria-hidden="true"></i>
                </button>
                <div
                  className="br-list z-50"
                  id="avatar-menu"
                  hidden={!userMenuOpen}
                  role="menu"
                  aria-labelledby="avatar-dropdown-trigger"
                >
                  <a className="br-item" href="#(0)" role="menuitem">
                    Dados pessoais
                  </a>
                  <button className="br-item" onClick={logout} role="menuitem">
                    Sair
                  </button>
                  <a className="br-item" href="#(0)" role="menuitem">
                    Notificações
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="header-bottom">
          <div className="header-menu">
            <div className="header-info">
              <div className="header-subtitle">
                Instituto Brasileiro de Museus
              </div>
              <div className="header-title">
                Inventário Nacional de Bens Culturais Musealizados
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
