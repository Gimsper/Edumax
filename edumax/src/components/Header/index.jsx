import { Link } from "react-router-dom"
import { useContext } from "react"
import { UserContext } from "../../contexts/UserContext"

import logo from '../../assets/img/edumax-logo.png'

import '../../assets/css/Header.css'

function Header() {
    const { isAuthenticated, logoutUser } = useContext(UserContext);

    const handleLogout = () => {
        logoutUser();
    }

    return (
        <header>
            <Link to="/" className="header-logo">
                <img src={logo} alt="Logo de Edumax" />
                <span>Edumax</span>
            </Link>
            <nav>
                <Link to="/">Inicio</Link>
                <Link to="/library">Biblioteca</Link>
                <Link to="/about">Conócenos</Link>
            </nav>
            {isAuthenticated ? (
                <button onClick={handleLogout}>Cerrar sesión</button>
            ) : (
                <Link to="/login">Iniciar sesión</Link>
            )}
        </header>
    )
}

export { Header }