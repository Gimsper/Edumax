import React, { useState } from 'react';

import '../../assets/css/Login.css'

function Login() {
    const [isRegister, setIsRegister] = useState(false);

    const handleToggle = () => setIsRegister(prev => !prev);

    return (
        <div className='login-container'>
            <h1 className='login-title'>{isRegister ? 'Registro' : 'Iniciar sesión'}</h1>
            <form className='login-form'>
                <div>
                    <label className='login-label'>Email:</label>
                    <input type="email" className='login-input' required />
                </div>
                <div>
                    <label className='login-label'>Contraseña:</label>
                    <input type="password" className='login-input' required />
                </div>
                {isRegister && (
                    <div>
                        <label className='login-label'>Confirmar Contraseña:</label>
                        <input type="password" className='login-input' required />
                    </div>
                )}
                <button type="submit" className='login-btn'>{isRegister ? 'Registrarse' : 'Ingresar'}</button>
            </form>
            <button type="button" onClick={handleToggle} className='login-link'>
                {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
        </div>
    );
}

export { Login };