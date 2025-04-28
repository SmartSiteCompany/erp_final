import { useState, useCallback } from 'react';
import axios from 'axios';

const NotaService = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const baseURL = 'http://localhost:8000/notas';

    const obtenerNotas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseURL}`);
            console.log("Respuesta de la API:", response.data);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            setLoading(false);
            throw err;
        }
    }, []);

    const crearNota = useCallback(async (nota) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${baseURL}`, nota);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            setLoading(false);
            throw err;
        }
    }, []);

    const obtenerNotaPorId = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseURL}/${id}`);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            setLoading(false);
            throw err;
        }
    }, []);

    const actualizarNota = useCallback(async (id, nota) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${baseURL}/${id}`, nota);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            setLoading(false);
            throw err;
        }
    }, []);

    const eliminarNota = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`${baseURL}/${id}`);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || err.message);
            setLoading(false);
            throw err;
        }
    }, []);

    return {
        loading,
        error,
        obtenerNotas,
        crearNota,
        obtenerNotaPorId,
        actualizarNota,
        eliminarNota,
    };
};

export default NotaService;