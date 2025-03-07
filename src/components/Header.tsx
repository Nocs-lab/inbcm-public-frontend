import React, { useState } from "react"
import { useNavigate, Link } from "react-router"
import logoIbramSimples from "../images/logo-ibram-simples.png"
import useStore from "../utils/store"

const Header: React.FC = () => {
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const { setUser, user } = useStore()
  // Função de logout
  const logout = () => {
    setUser(null)
    navigate("/login")
  }

  return (
    <header className="br-header compact large fixed">
      <div className="container-lg">
        <div className="header-top">
          <div className="header-logo">
            <img src={logoIbramSimples} alt="logo" />
          </div>
          {user && (
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
                    className="br-list z-50 w-full"
                    id="avatar-menu"
                    hidden={!userMenuOpen}
                    role="menu"
                    aria-labelledby="avatar-dropdown-trigger"
                  >
                    <Link to="/perfil">
                      <button className="br-item flex items-center space-x-2">
                        <i className="fa-solid fa-user"></i>
                        <span>Perfil</span>
                      </button>
                    </Link>
                    <button
                      className="br-item flex items-center space-x-2"
                      onClick={logout}
                      role="menuitem"
                    >
                      <i className="fa-solid fa-arrow-right-from-bracket"></i>
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
