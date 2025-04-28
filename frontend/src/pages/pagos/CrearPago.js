import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { useNavigate } from "react-router-dom";
import AlertComponent from "../../components/AlertasComponent";
import PagoService from "../../services/PagoService";
import ClienteService from "../../services/ClienteService";
import CotizacionService from "../../services/CotizacionService";
import { format } from 'date-fns';

const CrearPago = () => {
    const navigate = useNavigate();
    const { crearPago } = PagoService();
    const { obtenerClientes } = ClienteService();
    const { obtenerCotizaciones } = CotizacionService();
    
    const [formData, setFormData] = useState({
        cliente_id: "",
        cotizacion_id: "",
        fecha_pago: format(new Date(), 'yyyy-MM-dd'),
        monto_pago: 0,
        saldo_pendiente: 0,
        tipo_pago: "",
        metodo_pago: "Transferencia",
        referencia: "",
        observaciones: ""
    });
    
    const [clientes, setClientes] = useState([]);
    const [cotizaciones, setCotizaciones] = useState([]);
    const [cotizacionesFiltradas, setCotizacionesFiltradas] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [totalCotizacion, setTotalCotizacion] = useState(0);

    // Obtener clientes al cargar el componente
    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedClientes = await obtenerClientes();
                setClientes(fetchedClientes);
                
                const fetchedCotizaciones = await obtenerCotizaciones();
                setCotizaciones(fetchedCotizaciones);
            } catch (err) {
                console.error("Error al obtener datos:", err);
            }
        };
        fetchData();
    }, [obtenerClientes, obtenerCotizaciones]);

    // Filtrar cotizaciones cuando se selecciona un cliente
    useEffect(() => {
        if (formData.cliente_id) {
            const filtradas = cotizaciones.filter(cot => 
                cot.cliente_id && cot.cliente_id._id === formData.cliente_id
            );
            setCotizacionesFiltradas(filtradas);
        } else {
            setCotizacionesFiltradas([]);
        }
    }, [formData.cliente_id, cotizaciones]);

    // Actualizar saldo pendiente cuando cambia la cotización
    useEffect(() => {
        if (formData.cotizacion_id) {
            const cotizacionSeleccionada = cotizaciones.find(c => c._id === formData.cotizacion_id);
            if (cotizacionSeleccionada && typeof cotizacionSeleccionada.total !== 'undefined') {
                const total =cotizacionSeleccionada.total || 0;
                setTotalCotizacion(total);
                setFormData(prev => ({
                    ...prev,
                    saldo_pendiente: total - (prev.monto_pago || 0)
                }));
            }
        }
    }, [formData.cotizacion_id, cotizaciones]);

    // Actualizar saldo pendiente cuando cambia el monto
    useEffect(() => {
        if (formData.cotizacion_id) {
            setFormData(prev => ({
                ...prev,
                saldo_pendiente: totalCotizacion - prev.monto_pago
            }));
        }
    }, [formData.monto_pago, totalCotizacion]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleNumberInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones
        if (formData.monto_pago <= 0) {
            setAlertType("error");
            setAlertMessage("El monto del pago debe ser mayor a cero.");
            setShowAlert(true);
            return;
        }
        
        if (formData.saldo_pendiente < 0) {
            setAlertType("error");
            setAlertMessage("El monto del pago no puede ser mayor al total de la cotización.");
            setShowAlert(true);
            return;
        }

        try {
            await crearPago(formData);
            setAlertType("success");
            setAlertMessage("Pago registrado exitosamente.");
            setShowAlert(true);
            
            // Resetear formulario después de éxito
            setFormData({
                cliente_id: "",
                cotizacion_id: "",
                fecha_pago: format(new Date(), 'yyyy-MM-dd'),
                monto_pago: 0,
                saldo_pendiente: 0,
                tipo_pago: "Abono",
                metodo_pago: "Transferencia",
                referencia: "",
                observaciones: ""
            });
            
            // Redirigir después de 2 segundos
            setTimeout(() => navigate("/Lista_pagos"), 2000);
        } catch (error) {
            console.error("Error al registrar el pago:", error);
            setAlertType("error");
            setAlertMessage("Error al registrar el pago. Verifique los datos e intente nuevamente.");
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
                            <h3 className="font-size-h4">Crear un Pago</h3>
                             <div className="mb-6">
                            <img src="/assets/images/logo-dark.png" alt="logo" height="25" className="logo-dark" />  
                            <img src="/assets/images/logo-light.png" alt="logo" height="25" className="logo-light" />
                             </div>
                             </div>
                            <hr className="my-4" />

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="cliente_id" className="form-label">Cliente <span className="text-danger">*</span></label>
                                            <select
                                                className="form-select" id="cliente_id" name="cliente_id"
                                                value={formData.cliente_id} onChange={handleInputChange} required
                                            >
                                                <option value="">Seleccione un cliente</option>
                                                {clientes.map(cliente => (
                                                    <option key={cliente._id} value={cliente._id}>
                                                        {cliente.nombre} {cliente.apellidos}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="cotizacion_id" className="form-label">Cotización <span className="text-danger">*</span></label>
                                            <select
                                                className="form-select" id="cotizacion_id" name="cotizacion_id"
                                                value={formData.cotizacion_id} onChange={handleInputChange} 
                                                required disabled={!formData.cliente_id}
                                            >
                                                <option value="">Seleccione una cotización</option>
                                                {cotizacionesFiltradas.map(cotizacion => (
                                                    <option key={cotizacion._id} value={cotizacion._id}>
                                                        #{cotizacion.numero || 'N/A'} - Total: ${(cotizacion.total || 0).toFixed(2)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="fecha_pago" className="form-label">Fecha de Pago <span className="text-danger">*</span></label>
                                            <input
                                                type="date" className="form-control" id="fecha_pago" name="fecha_pago"
                                                value={formData.fecha_pago} onChange={handleInputChange} required
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="tipo_pago" className="form-label">Tipo de Pago <span className="text-danger">*</span></label>
                                            <select
                                                className="form-select" id="tipo_pago" name="tipo_pago"
                                                value={formData.tipo_pago} onChange={handleInputChange} required
                                            >
                                                <option value="Contado">Contado</option>
                                                <option value="Financiado">Financiado</option>
                                                <option value="Anticipo">Anticipo</option>
                                                <option value="Abono">Abono</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="metodo_pago" className="form-label">Método de Pago <span className="text-danger">*</span></label>
                                            <select
                                                className="form-select" id="metodo_pago" name="metodo_pago"
                                                value={formData.metodo_pago} onChange={handleInputChange} required
                                            >
                                                <option value="Efectivo">Efectivo</option>
                                                <option value="Transferencia">Transferencia</option>
                                                <option value="Tarjeta">Tarjeta</option>
                                                <option value="Cheque">Cheque</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="monto_pago" className="form-label">Monto del Pago <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text">$</span>
                                                <input
                                                    type="number" step="0.01" min="0.01" className="form-control" id="monto_pago" name="monto_pago"
                                                    value={formData.monto_pago} onChange={handleNumberInputChange} required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="saldo_pendiente" className="form-label">Saldo Pendiente</label>
                                            <div className="input-group">
                                                <span className="input-group-text">$</span>
                                                <input
                                                    type="number" className="form-control" id="saldo_pendiente" name="saldo_pendiente"
                                                    value={formData.saldo_pendiente.toFixed(2)} readOnly
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label htmlFor="referencia" className="form-label">Referencia/Comprobante</label>
                                            <input
                                                type="text" className="form-control" id="referencia" name="referencia"
                                                value={formData.referencia} onChange={handleInputChange}
                                                placeholder="Número de transacción o folio"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="observaciones" className="form-label">Observaciones</label>
                                    <textarea
                                        className="form-control" id="observaciones" name="observaciones" rows="3"
                                        value={formData.observaciones} onChange={handleInputChange}
                                        placeholder="Notas adicionales sobre el pago"
                                    />
                                </div>

                                <div className="d-print-none mt-4">
                                    <div className="float-end">
                                        <button type="button" className="btn btn-secondary me-2" onClick={() => navigate('/Lista_pagos')}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-primary w-md waves-effect waves-light">
                                            Registrar Pago
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
            {showAlert && (
                <AlertComponent
                    type={alertType} 
                    entity="Pago"
                    action={alertType === "success" ? "create" : "error"}
                    onCancel={handleAlertClose} 
                    message={alertMessage}
                />
            )}
        </Layout>
    );
};

export default CrearPago;