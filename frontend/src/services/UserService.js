import axios from 'axios';

const baseURL = 'http://localhost:8000/users';
const authBaseURL = 'http://localhost:8000/auth';

const UserService = {
    subirFotoPerfil: async (formData, token) => {
        try {
            const response = await axios.post(`${baseURL}/upload-photo`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            throw new Error(errorMessage);
        }
    },

    obtenerPerfil: async (token) => {
        try {
            const response = await axios.get(`${authBaseURL}/perfil`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            throw new Error(errorMessage);
        }
    },

    obtenerUsuarios: async () => {
        try {
            const response = await axios.get(`${baseURL}`);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            throw new Error(errorMessage);
        }
    },

    crearUsuario: async (usuario) => {
        try {
            const response = await axios.post(`${baseURL}`, usuario);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            throw new Error(errorMessage);
        }
    },

    obtenerUsuarioPorId: async (id) => {
        try {
            const response = await axios.get(`${baseURL}/${id}`);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            throw new Error(errorMessage);
        }
    },

    actualizarUsuario: async (id, usuario) => {
        try {
            const response = await axios.put(`${baseURL}/${id}`, usuario);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            throw new Error(errorMessage);
        }
    },

    eliminarUsuario: async (id) => {
        try {
            const response = await axios.delete(`${baseURL}/${id}`);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            throw new Error(errorMessage);
        }
    }
};

export default UserService;
