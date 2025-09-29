import React, { createContext, useState } from 'react';
import LocalForage from 'localforage';

const UserContext = createContext();

function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const createUser = async (userData) => {
        const existingUsers = await LocalForage.getItem('Users');
        const users = existingUsers ? existingUsers : [];
        users.push(userData);
        await LocalForage.setItem('Users', users);
    }

    const loginUser = async (userData) => {
        const existingUsers = await LocalForage.getItem('Users');
        const users = existingUsers ? existingUsers : [];
        const user = users.find(u => u.email === userData.email && u.password === userData.password);
        console.log(user);
        if (user) {
            setUser(user);
            setIsAuthenticated(true);
        } else {
            setError('Credenciales inválidas');
        }
    }

    const logoutUser = () => {
        setUser(null);
        setIsAuthenticated(false);
    }

    const values = {
        createUser,
        loginUser,
        logoutUser,
        user,
        error,
        isAuthenticated,
    }

    return (
        <UserContext.Provider value={values}>
            {children}
        </UserContext.Provider>
    );
}

export { UserProvider, UserContext };