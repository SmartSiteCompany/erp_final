import { useState, useCallback } from 'react';
import axios from 'axios';

const InteraccionService = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const baseURL = 'http://localhost:8000/interacciones';

    const obtenerInteracciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseURL}`);
            console.log("Respuesta de la API:", response.data); 
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    }, []);

    const crearInteraccion = async (interaccion) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${baseURL}`, interaccion);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    };

    const obtenerInteraccionPorId = async (id) => {
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

    const actualizarInteraccion = async (id, interaccion) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${baseURL}/${id}`, interaccion);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    };

    const eliminarInteraccion = async (id) => {
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
        obtenerInteracciones,
        crearInteraccion,
        obtenerInteraccionPorId,
        actualizarInteraccion,
        eliminarInteraccion,
    };
};

export default InteraccionService;