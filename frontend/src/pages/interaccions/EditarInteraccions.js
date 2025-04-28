import React, { useState, useEffect } from "react";
import {Link,useParams, useNavigate } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import InteraccionService from "../../services/InteraccionService";
import ClienteService from "../../services/ClienteService";

const EditarInteraccion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { obtenerInteraccionPorId, actualizarInteraccion } = InteraccionService();
    const { obtenerClientes } = ClienteService();
    
    const [interaccion, setInteraccion] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Load clients and interaction in parallel
                const [listaClientes, foundInteraccion] = await Promise.all([
                    obtenerClientes(),
                    obtenerInteraccionPorId(id)
                ]);

                if (!foundInteraccion) {
                    setNotFound(true);
                    return;
                }

                setClientes(listaClientes);
                setInteraccion(foundInteraccion);

                // Set selected client if exists
                if (foundInteraccion.cliente_id) {
                    const cliente = listaClientes.find(c => c._id === foundInteraccion.cliente_id);
                    setClienteSeleccionado(cliente || null);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        setInteraccion({ 
            ...interaccion, 
            [e.target.name]: e.target.value 
        });
    };

    const handleClienteChange = (e) => {
        const clienteId = e.target.value;
        const cliente = clientes.find(c => c._id === clienteId);
        setClienteSeleccionado(cliente);
        setInteraccion({
            ...interaccion,
            cliente_id: clienteId
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Basic validation
            if (!interaccion.tipo_interaccion || !interaccion.descripcion) {
                throw new Error("Tipo y descripción son campos requeridos");
            }

            await actualizarInteraccion(id, interaccion);
            navigate("/ListaInteraccions");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (notFound) {
        return (
            <Layout>
                <div className="alert alert-danger mt-3">
                    Interacción no encontrada
                </div>
                <Link to="/ListaInteraccions" className="btn btn-secondary mt-3">
                    Volver al Listado
                </Link>
            </Layout>
        );
    }

    if (loading || !interaccion) {
        return (
            <LoadingError
                loading={true}
                loadingMessage="Cargando datos..."
            />
        );
    }

    return (
        <LoadingError
            loading={loading}
            error={error}
            loadingMessage="Cargando datos..."
            errorMessage={error}
        >
            <Layout>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-body">
                                <h2 className="font-size-h4 mb-4">Editar Interacción</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Tipo de Interacción</label>
                                            <select
                                                name="tipo_interaccion"
                                                value={interaccion.tipo_interaccion || ""}
                                                onChange={handleChange}
                                                className="form-select"
                                                required
                                            >
                                                <option value="">Seleccionar tipo</option>
                                                <option value="llamada">Llamada</option>
                                                <option value="reunion">Reunión</option>
                                                <option value="email">Email</option>
                                                <option value="visita">Visita</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Cliente</label>
                                            <select
                                                className="form-select"
                                                value={clienteSeleccionado?._id || ""}
                                                onChange={handleClienteChange}
                                            >
                                                <option value="">Sin cliente asignado</option>
                                                {clientes.map(cliente => (
                                                    <option key={cliente._id} value={cliente._id}>
                                                        {cliente.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Fecha</label>
                                            <input
                                                type="datetime-local"
                                                name="fecha"
                                                value={interaccion.fecha ? new Date(interaccion.fecha).toISOString().slice(0, 16) : ""}
                                                onChange={handleChange}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Estado</label>
                                            <select
                                                name="estado"
                                                value={interaccion.estado || ""}
                                                onChange={handleChange}
                                                className="form-select"
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="completada">Completada</option>
                                                <option value="cancelada">Cancelada</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Descripción</label>
                                        <textarea
                                            name="descripcion"
                                            value={interaccion.descripcion || ""}
                                            onChange={handleChange}
                                            className="form-control"
                                            rows="4"
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Responsable</label>
                                        <input
                                            type="text"
                                            name="responsable"
                                            value={interaccion.responsable || ""}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="text-end">
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary me-2"
                                            onClick={() => navigate("/ListaInteraccions")}
                                        >
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </LoadingError>
    );
};

export default EditarInteraccion;