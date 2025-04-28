import { useState, useCallback } from 'react';
import axios from 'axios';

const ServicioFinanciadoService = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const baseURL = 'http://localhost:8000/servicios';

    const obtenerServicioFinanciados = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseURL}`);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    }, []);

    const crearServicioFinanciado = async (serviciofinanciado) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${baseURL}`, serviciofinanciado);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    };

    const obtenerServicioFinanciadoPorId = async (id) => {
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

    const actualizarServicioFinanciado = async (id, serviciofinanciado) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${baseURL}/${id}`, serviciofinanciado);
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err);
            setLoading(false);
            throw err;
        }
    };

    const eliminarServicioFinanciado = async (id) => {
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
        obtenerServicioFinanciados,
        crearServicioFinanciado,
        obtenerServicioFinanciadoPorId,
        actualizarServicioFinanciado,
        eliminarServicioFinanciado,
    };
};

export default ServicioFinanciadoService;
