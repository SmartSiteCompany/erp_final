import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { useNavigate } from "react-router-dom";
import AlertComponent from "../../components/AlertasComponent";
import CampanaService from "../../services/CampanaService";
import ClienteService from "../../services/ClienteService";

const CrearCampana = ({ onCampanaCreada }) => {
    const navigate = useNavigate();
    const { crearCampana } = CampanaService();
    const { obtenerClientes } = ClienteService();
    const [formData, setFormData] = useState({
        nombre: "", descripcion: "",  fecha_inicio: new Date().toISOString().split('T')[0], fecha_fin: "", estado: "activa", clientes: [],
    });
    const [clientesDisponibles, setClientesDisponibles] = useState([]);
    const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
    const [mostrarSelectorClientes, setMostrarSelectorClientes] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState("");
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const fetchedClientes = await obtenerClientes();
                setClientesDisponibles(fetchedClientes);
            } catch (err) {
                console.error("Error al obtener clientes:", err);
            }
        };
        fetchClientes();
    }, [obtenerClientes]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFechaInicioChange = (e) => {
        setFormData({ ...formData, fecha_inicio: e.target.value });
    };

    const handleFechaFinChange = (e) => {
        setFormData({ ...formData, fecha_fin: e.target.value });
    };

    const handleEstadoChange = (e) => {
        setFormData({ ...formData, estado: e.target.value });
    };

    const toggleSelectorClientes = () => {
        setMostrarSelectorClientes(!mostrarSelectorClientes);
    };

    const handleClienteSeleccionado = (clienteId) => {
        if (!clientesSeleccionados.includes(clienteId)) {
            setClientesSeleccionados([...clientesSeleccionados, clienteId]);
        } else {
            setClientesSeleccionados(clientesSeleccionados.filter((id) => id !== clienteId));
        }
    };

    useEffect(() => {
        setFormData({ ...formData, clientes: clientesSeleccionados });
    }, [clientesSeleccionados]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await crearCampana(formData);
            setAlertType("success");
            setAlertMessage("Campaña creada exitosamente.");
            setShowAlert(true);
            navigate(`/Campanas`);
            setFormData({
                nombre: "", descripcion: "", fecha_inicio: new Date().toISOString().split('T')[0], fecha_fin: "",  estado: "activa", clientes: [],
            });
            setClientesSeleccionados([]);
            setMostrarSelectorClientes(false);
            if (onCampanaCreada) {
                onCampanaCreada(formData);
                navigate(`/Campanas`);
            }
        } catch (error) {
            console.error("Error al crear la campaña:", error);
            setAlertType("error");
            setAlertMessage("Error al crear la campaña.");
            setShowAlert(true);
        }
    };

    const handleAlertClose = () => {
        setShowAlert(false);
    };

    return (
        <Layout>
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-body">
                        <div className="invoice-title d-flex justify-content-between align-items-center">
                            <h3 className="font-size-h4">Agregar Campaña</h3>
                             <div className="mb-6">
                            <img src="/assets/images/logo-light.png" alt="logo" height="25" className="logo-light" />
                            <img src="/assets/images/logo-dark.png" alt="logo" height="25" className="logo-dark" />  

                             </div>
                             </div>
                              <hr className="my-3"/>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="nombre" className="form-label">Nombre <span className="text-danger">*</span></label>
                                    <input
                                        type="text" className="form-control" id="nombre" name="nombre"
                                        value={formData.nombre} onChange={handleInputChange} required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="descripcion" className="form-label">Descripción <span className="text-danger">*</span></label>
                                    <textarea
                                        className="form-control" id="descripcion" name="descripcion"
                                        value={formData.descripcion} onChange={handleInputChange} required
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="fecha_inicio" className="form-label">Fecha de Inicio <span className="text-danger">*</span></label>
                                            <input
                                                type="date" className="form-control" id="fecha_inicio" name="fecha_inicio"
                                                value={formData.fecha_inicio} onChange={handleFechaInicioChange} required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="fecha_fin" className="form-label">Fecha de Fin <span className="text-danger">*</span></label>
                                            <input
                                                type="date" className="form-control" id="fecha_fin" name="fecha_fin"
                                                value={formData.fecha_fin} onChange={handleFechaFinChange} required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="estado" className="form-label">Estado</label>
                                    <select
                                        className="form-select" id="estado" name="estado"
                                        value={formData.estado} onChange={handleEstadoChange}
                                    >
                                        <option value="activa">Activa</option>
                                        <option value="inactiva">Inactiva</option>
                                        <option value="completada">Completada</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Seleccionar Clientes <span className="text-danger">*</span></label>
                                    <button type="button" className="btn btn-outline-info mb-2" onClick={toggleSelectorClientes}>
                                        {mostrarSelectorClientes ? 'Ocultar Clientes' : 'Mostrar Clientes'}
                                    </button>
                                    {mostrarSelectorClientes && (
                                        <div className="border p-3 rounded">
                                            <ul className="list-unstyled" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                {clientesDisponibles.map(cliente => (
                                                    <li key={cliente._id}>
                                                        <div className="form-check">
                                                            <input
                                                                type="checkbox" className="form-check-input" id={`cliente-${cliente._id}`} value={cliente._id}
                                                                checked={clientesSeleccionados.includes(cliente._id)} onChange={() => handleClienteSeleccionado(cliente._id)}
                                                            />
                                                            <label className="form-check-label" htmlFor={`cliente-${cliente._id}`}>
                                                                {cliente.nombre} {cliente.apellidos}
                                                            </label>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {clientesSeleccionados.length > 0 && (
                                    <div className="mb-3">
                                        <label className="form-label">Clientes Seleccionados:</label>
                                        <ul className="list-group">
                                            {clientesSeleccionados.map(clienteId => {
                                                const cliente = clientesDisponibles.find(c => c._id === clienteId);
                                                return cliente ? (
                                                    <li key={cliente._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                        {cliente.nombre} {cliente.apellidos}
                                                        <button
                                                            type="button" className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleClienteSeleccionado(cliente._id)}
                                                        >
                                                            <i className="mdi mdi-close"></i>
                                                        </button>
                                                    </li>
                                                ) : null;
                                            })}
                                        </ul>
                                    </div>
                                )}

                                <div className="d-print-none mt-4">
                                    <div className="float-end">
                                        <button type="submit" className="btn btn-primary w-md waves-effect waves-light">Crear Campaña</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {showAlert && (
                <AlertComponent
                    type={alertType} entity="Campaña"
                    action={alertType === "success" ? "create" : "error"}
                    onCancel={handleAlertClose} message={alertMessage}
                />
            )}
        </Layout>
    );
};

export default CrearCampana;