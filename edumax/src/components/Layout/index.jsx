import { Header } from '../Header'
import { Footer } from '../Footer'

import '../../assets/css/Layout.css'

function Layout({ children }) {
    return (
        <div className="layout">
            <Header />
            <main>{children}</main>
            <Footer />
        </div>
    )
}

export { Layout }