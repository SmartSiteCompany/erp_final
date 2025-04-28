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

    const buscarPorCodigo = async (codigo) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseURL}/codigo/${codigo}`);
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

    const cargarCatalogo = async (file) => {
        setLoading(true);
        setError(null);
        try {
            // Validación básica en el frontend
            if (!file) {
                throw new Error('No se seleccionó ningún archivo');
            }
    
            // Verificar tipo de archivo
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
                'text/csv'
            ];
            
            if (!validTypes.includes(file.type)) {
                throw new Error('Tipo de archivo no válido. Solo se aceptan XLSX, XLS o CSV');
            }
    
            // Verificar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('El archivo es demasiado grande. Tamaño máximo: 5MB');
            }
    
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await axios.post(`${baseURL}/cargar-excel`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 30000 // 30 segundos de timeout
            });
            
            setLoading(false);
            return response.data;
        } catch (err) {
            let errorMessage = 'Error al cargar el catálogo';
            
            if (err.response) {
                // Error del servidor
                errorMessage = err.response.data.error || err.response.data.message || errorMessage;
            } else if (err.request) {
                // Error de conexión
                errorMessage = 'No se pudo conectar con el servidor';
            } else {
                // Error del frontend
                errorMessage = err.message || errorMessage;
            }
            
            setError(errorMessage);
            setLoading(false);
            throw new Error(errorMessage);
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

    const eliminarProducto = async (codigo) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`${baseURL}/${codigo}`);
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
        buscarPorCodigo,
        obtenerPorCategoria,
        cargarCatalogo,
        actualizarProducto,
        eliminarProducto
    };
};

export default CatalogoService;