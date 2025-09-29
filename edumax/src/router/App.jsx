import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout';

import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Library } from '../pages/Library';
import { About } from '../pages/About';
import { UserProvider } from '../contexts/UserContext';
import { LibraryProvider } from '../contexts/LibraryContext';

const NotFound = () => <h1>Página no encontrada</h1>;

const App = () => (
    <Router basename="/Edumax">
        <UserProvider>
            <LibraryProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/about" element={<About />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Layout>
            </LibraryProvider>
        </UserProvider>
    </Router>
);

export { App };