import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api('/user')
            .then((data) => setUser(data.user))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    async function login(credentials) {
        const data = await api('/login', {
            method: 'POST',
            body: credentials,
        });
        setUser(data.user);
        return data;
    }

    async function register(payload) {
        const data = await api('/register', {
            method: 'POST',
            body: payload,
        });
        setUser(data.user);
        return data;
    }

    async function logout() {
        await api('/logout', { method: 'POST' });
        setUser(null);
    }

    async function updateProfile(formData) {
        const data = await api('/profile', {
            method: 'POST',
            body: formData,
        });
        setUser(data.user);
        return data;
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
