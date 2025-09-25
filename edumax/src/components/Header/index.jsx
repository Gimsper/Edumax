import { Link } from "react-router-dom"

import '../../assets/css/Header.css'

function Header() {
    return (
        <header>
            <Link to="/" className="header-logo">Edumax</Link>
            <nav>
                <Link to="/">Inicio</Link>
                <Link to="/library">Biblioteca</Link>
                <Link to="/about">Conócenos</Link>
            </nav>
            <Link to="/login">Iniciar sesión</Link>
        </header>
    )
}

export { Header }