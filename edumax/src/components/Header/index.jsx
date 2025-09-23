import { Link } from "react-router-dom"

function Header() {
    return (
        <header>
            <h1>Edumax</h1>
            <nav>
                <Link to="/">Inicio</Link>
                <Link to="/about">Acerca de</Link>
                <Link to="/library">Biblioteca</Link>
            </nav>
            <Link to="/login">Iniciar sesión</Link>
        </header>
    )
}

export { Header }