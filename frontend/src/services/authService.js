// services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/auth'; // Cambia la URL base para utilizar las rutas de autenticación
// services/authService.js
const register = async (name, apellidos, email, password, area) => { // Agrega 'area' como parámetro
    try {
        const response = await axios.post(`${API_URL}/registro`, {
            name,
            apellidos,
            email,
            password,
            area, 
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};


// En tu authService.js (función login)
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    
    if (response.data.token) {
      // Guarda el token en localStorage y sessionStorage como respaldo
      localStorage.setItem('token', response.data.token);
      sessionStorage.setItem('token', response.data.token);
      
      // Guarda datos básicos del usuario
      if (response.data.user) {
        const userData = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      setAuthToken(response.data.token);
      return response.data;
    }
    throw new Error('No se recibió token en la respuesta');
  } catch (error) {
    // Limpia cualquier token previo en caso de error
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error.response?.data || { error: "Error en el login" };
  }
};

const verifyToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const response = await axios.get(`${API_URL}/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    logout();
    throw error.response?.data || { error: "Error verificando token" };
  }
};

const logout = async () => {
  try {
    // 1. Intentar logout en el backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${API_URL}/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (serverError) {
      console.error('Error en logout del servidor:', serverError);
      // Continuamos aunque falle el logout del servidor
    }

    // 2. Limpiar frontend
    localStorage.clear();
    sessionStorage.clear();
    delete axios.defaults.headers.common['Authorization'];

    // 3. Limpiar cookies relacionadas con la sesión
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });

    return true; // Indicar que el logout fue exitoso
  } catch (error) {
    console.error('Error durante logout:', error);
    // Forzar limpieza incluso si hay error
    localStorage.clear();
    sessionStorage.clear();
    throw error;
  }
};

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};



const authService = {
  register,
  login,
  verifyToken,
  logout,
  setAuthToken
};

export default authService;