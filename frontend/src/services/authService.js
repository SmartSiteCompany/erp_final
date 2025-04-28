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


const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      // Configurar axios para enviar el token en futuras peticiones
      setAuthToken(response.data.token);
    }
    
    return response.data;
  } catch (error) {
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

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
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