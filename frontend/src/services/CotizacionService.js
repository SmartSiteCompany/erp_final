import { useState, useCallback } from 'react';
import axios from 'axios';

const CotizacionService = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const baseURL = 'http://localhost:8000/cotizaciones';

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        };
    };

    const obtenerCotizaciones = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(baseURL, { 
                params,
                headers: getAuthHeaders()
            });
            return response.data.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const obtenerCotizacionPorId = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseURL}/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data.data;
        } catch (err) {
            setError(err.response?.data || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const crearCotizacion = async (cotizacionData) => {
        setLoading(true);
        try {
            // Log token for debugging purposes
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            console.log("Token en servicio:", token ? "Presente" : "No encontrado");
            
            if (!token) {
                throw new Error("No authentication token found. Please log in again.");
            }
            
            const response = await axios.post(baseURL, cotizacionData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error en crearCotizacion:', error);
            // Enhance error handling
            if (error.response?.status === 401) {
                localStorage.removeItem('token'); // Clear invalid token
                throw new Error("Sesión expirada o inválida. Por favor, inicie sesión nuevamente.");
            }
        throw error;
        } finally {
            setLoading(false);
        }
    };

    const actualizarCotizacion = async (id, cotizacionData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${baseURL}/${id}`, cotizacionData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (err) {
            setError(err.response?.data || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const eliminarCotizacion = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`${baseURL}/${id}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (err) {
            setError(err.response?.data || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const activarServicio = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${baseURL}/${id}/activar`, {}, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (err) {
            setError(err.response?.data || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const registrarPago = async (id, pagoData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${baseURL}/${id}/pagos`, pagoData, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (err) {
            setError(err.response?.data || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        obtenerCotizaciones,
        obtenerCotizacionPorId,
        crearCotizacion,
        actualizarCotizacion,
        eliminarCotizacion,
        activarServicio,
        registrarPago
    };
};

export default CotizacionService;