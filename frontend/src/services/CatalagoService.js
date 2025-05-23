import { useState, useCallback } from 'react';
import axios from 'axios';

const CatalogoService = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const baseURL = 'http://localhost:8000/catalogos';

    const obtenerCatalogo = useCallback(async (categoria, estatus) => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (categoria) params.categoria = categoria;
            if (estatus) params.estatus = estatus;
            
            const response = await axios.get(`${baseURL}`, { params });
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    }, []);

    const crearProducto = async (producto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${baseURL}`, producto);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    };

    const buscarPorId = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseURL}/${id}`);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    };

    const obtenerPorCategoria = async (categoria) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseURL}/categoria/${categoria}`);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    };

    const cargarCatalogo = async (file, onUploadProgress, cancelToken) => {
        setLoading(true);
        setError(null);
        
        try {
            const formData = new FormData();
            formData.append('archivo', file);

            const response = await axios.post(`${baseURL}/cargar-excel`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress,
                cancelToken,
                timeout: 300000 // 5 minutos timeout
            });

            setLoading(false);
            return response.data;
        } catch (err) {
            let errorMessage = 'Error al cargar el catálogo';
            let errorDetails = '';
            
            if (err.response) {
                // Error del servidor
                if (err.response.data) {
                    errorMessage = err.response.data.error || 
                                  err.response.data.message || 
                                  errorMessage;
                    errorDetails = err.response.data.details || 
                                 (Array.isArray(err.response.data.errors) ? 
                                  err.response.data.errors.join('. ') : 
                                  'Error en el servidor');
                }
            } else if (err.request) {
                // Error de conexión
                errorMessage = 'No se pudo conectar con el servidor';
                errorDetails = 'Verifica tu conexión a internet e intenta nuevamente';
            } else {
                // Error del frontend
                errorDetails = err.message;
            }
            
            setError(errorMessage);
            setLoading(false);
            
            const errorObj = new Error(errorMessage);
            errorObj.details = errorDetails;
            errorObj.response = err.response;
            throw errorObj;
        }
    };

    const actualizarProducto = async (codigo, producto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${baseURL}/${codigo}`, producto);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    };

    const eliminarPorId = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`${baseURL}/${id}`);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    };

    return {
        loading,
        error,
        obtenerCatalogo,
        crearProducto,
        buscarPorId,
        obtenerPorCategoria,
        cargarCatalogo,
        actualizarProducto,
        eliminarPorId
    };
};

export default CatalogoService;