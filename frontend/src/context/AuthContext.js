import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/UserService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLocked, setIsLocked] = useState(localStorage.getItem('isLocked') === 'true');

    // Mueve handleLogout antes de su uso
    const handleLogout = async () => {
        await authService.logout();
        setUser(null);
        setToken(null);
        setIsLocked(false);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('isLocked');
    };

    // Verificación de autenticación
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
                
                if (!storedToken) {
                    await handleLogout();
                    return;
                }

                // Verificar si la pantalla está bloqueada primero
                const locked = localStorage.getItem('isLocked') === 'true';
                setIsLocked(locked);
                
                if (locked) {
                    setLoading(false);
                    return; // No verificar token si está bloqueado
                }

                // Si no está bloqueado, verificar token
                await authService.verifyToken();
                const profile = await userService.obtenerPerfil(storedToken);
                setUser(profile);
                setToken(storedToken);
                
            } catch (err) {
                await handleLogout();
            } finally {
                setLoading(false);
            }
        };
        
        checkAuth();
    }, []); // Elimina dependencias para que solo se ejecute una vez al montar

    const login = async (email, password, rememberMe = false) => {
        try {
            setLoading(true);
            setError(null);
            const data = await authService.login(email, password);
            
            if (data.token) {
                if (rememberMe) {
                    localStorage.setItem('token', data.token);
                    sessionStorage.removeItem('token');
                } else {
                    sessionStorage.setItem('token', data.token);
                    localStorage.removeItem('token');
                }
                
                setToken(data.token);
                authService.setAuthToken(data.token);
                
                const profile = await userService.obtenerPerfil(data.token);
                setUser(profile);
                setIsLocked(false);
            }
            return data;
        } catch (err) {
            setError(err.message || "Error en el login");
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
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                authService.setAuthToken(data.token);
                
                if (data.usuario) {
                    setUser(data.usuario);
                } else {
                    const profile = await userService.obtenerPerfil(data.token);
                    setUser(profile);
                }
                
                setIsLocked(false);
            }
            return data;
        } catch (err) {
            setError(err.message || "Error en el registro");
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    const lockScreen = async () => {
        setIsLocked(true);
        localStorage.setItem('isLocked', 'true');
        localStorage.setItem('user', JSON.stringify(user)); // Guarda user actual
    };

    const unlockScreen = async () => {
        setIsLocked(false);
        localStorage.removeItem('isLocked');
    };

    // Usa handleLogout en el objeto de logout que expones
    const logout = handleLogout;

    const value = {
        user,
        token,
        loading,
        error,
        isLocked,
        isAuthenticated: !!user && !isLocked,
        login,
        register,
        logout, // Ahora usa handleLogout
        lockScreen,
        unlockScreen
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};