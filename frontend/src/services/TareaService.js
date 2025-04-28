import { useState, useCallback } from 'react';
import axios from 'axios';

const TareaService = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const baseURL = 'http://localhost:8000/tareas';

    // Configuración común para las respuestas
    const handleResponse = (response) => {
        // Los datos vendrán con cliente_id poblado gracias al populate del backend
        return response.data;
    };

    const handleError = (err) => {
        const errorMessage = err.response?.data?.error || err.message;
        setError(errorMessage);
        throw new Error(errorMessage);
    };

    const obtenerTareas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseURL}`);
            setLoading(false);
            return handleResponse(response);
        } catch (err) {
            setLoading(false);
            return handleError(err);
        }
    }, []);

    const crearTarea = async (tarea) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${baseURL}`, tarea);
            setLoading(false);
            return handleResponse(response);
        } catch (err) {
            setLoading(false);
            return handleError(err);
        }
    };

    const obtenerTareaPorId = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseURL}/${id}`);
            setLoading(false);
            return handleResponse(response);
        } catch (err) {
            setLoading(false);
            return handleError(err);
        }
    };

    const actualizarTarea = async (id, tarea) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${baseURL}/${id}`, tarea);
            setLoading(false);
            return handleResponse(response);
        } catch (err) {
            setLoading(false);
            return handleError(err);
        }
    };

    const eliminarTarea = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`${baseURL}/${id}`);
            setLoading(false);
            return handleResponse(response);
        } catch (err) {
            setLoading(false);
            return handleError(err);
        }
    };

    return {
        loading,
        error,
        obtenerTareas,
        crearTarea,
        obtenerTareaPorId,
        actualizarTarea,
        eliminarTarea,
    };
};

export default TareaService;