// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Verificar autenticación al cargar la app
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                const userData = await authService.verifyToken();
                if (userData) {
                    setUser(userData.user || JSON.parse(localStorage.getItem('user')));
                }
            } catch (err) {
                authService.logout();
                setError(err.error || "Error de autenticación");
            } finally {
                setLoading(false);
            }
        };
        
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.login(email, password);
            setUser(data.user || JSON.parse(localStorage.getItem('user')));
            return data;
        } catch (err) {
            setError(err.error || "Error en el login");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, apellidos, email, password, area) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.register(name, apellidos, email, password, area);
            return data;
        } catch (err) {
            setError(err.error || "Error en el registro");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}