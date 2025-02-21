import React from "react"
import logoIbramSimples from "../images/logo-ibram-simples.png"

const Header: React.FC = () => {
  return (
    <header className="br-header compact large fixed">
      <div className="container-lg">
        <div className="header-top">
          <div className="header-logo">
            <img src={logoIbramSimples} alt="logo" />
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
