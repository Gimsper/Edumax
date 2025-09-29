import { useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

import '../../assets/css/Login.css'

function Login() {
    const { loginUser, createUser, isAuthenticated, error } = useContext(UserContext);
    const [isRegister, setIsRegister] = useState(false);
    const handleToggle = () => setIsRegister(prev => !prev);
    const navigate = useNavigate();

    if (isAuthenticated) {
        navigate('/');
    }

    return (
        <div className='login-background'>
            <div className='login-container'>
                <h1 className='login-title'>{isRegister ? 'Registro' : 'Iniciar sesión'}</h1>
                <form className='login-form' onSubmit={async (e) => {
                    e.preventDefault();
                    const email = e.target.email.value;
                    const password = e.target.password.value;
                    if (isRegister) {
                        const confirmPassword = e.target.confirmPassword.value;
                        if (password !== confirmPassword) {
                            alert('Las contraseñas no coinciden');
                            return;
                        }
                        createUser({ email, password });
                        await alert('Registro exitoso, ya puedes iniciar sesión');
                        window.location.reload();
                    } else {
                        loginUser({ email, password });
                        if (error) { alert(error); }
                        else {
                            await alert('Inicio de sesión exitoso');
                            navigate('/');
                        }
                    }
                }}>
                    <div>
                        <label className='login-label'>Email:</label>
                        <input type="email" className='login-input' name="email" required />
                    </div>
                    <div>
                        <label className='login-label'>Contraseña:</label>
                        <input type="password" className='login-input' name="password" required />
                    </div>
                    {isRegister && (
                        <div>
                            <label className='login-label'>Confirmar Contraseña:</label>
                            <input type="password" className='login-input' name="confirmPassword" required />
                        </div>
                    )}
                    <button type="submit" className='login-btn'>{isRegister ? 'Registrarse' : 'Ingresar'}</button>
                </form>
                <button type="button" onClick={handleToggle} className='login-link'>
                    {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </button>
            </div>
        </div>
    );
}

export { Login };