import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import AlertComponent from "../../components/AlertasComponent";
import PagoService from "../../services/PagoService";
import ClienteService from "../../services/ClienteService";
import CotizacionService from "../../services/CotizacionService";
import LoadingError from "../../components/LoadingError";
import { format } from 'date-fns';

const EditarPago = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { obtenerPagoPorId, actualizarPago } = PagoService();
  const { obtenerClientes } = ClienteService();
  const { obtenerCotizaciones } = CotizacionService();
  
  const [formData, setFormData] = useState({
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

  const [clientes, setClientes] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cotizacionesFiltradas, setCotizacionesFiltradas] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCotizacion, setTotalCotizacion] = useState(0);

  const tiposPago = ["Contado", "Financiado", "Anticipo", "Abono"];
  const metodosPago = ["Efectivo", "Transferencia", "Tarjeta", "Cheque"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener pago existente
        const pago = await obtenerPagoPorId(id);
        setFormData({
          ...pago,
          fecha_pago: pago.fecha_pago?.split('T')[0] || format(new Date(), 'yyyy-MM-dd')
        });

        // Obtener clientes y cotizaciones
        const [clientesData, cotizacionesData] = await Promise.all([
          obtenerClientes(),
          obtenerCotizaciones()
        ]);
        
        setClientes(clientesData);
        setCotizaciones(cotizacionesData);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Filtrar cotizaciones cuando cambia el cliente seleccionado
  useEffect(() => {
    if (formData.cliente_id) {
      const filtradas = cotizaciones.filter(cot => 
        cot.cliente_id?._id === formData.cliente_id
      );
      setCotizacionesFiltradas(filtradas);
    } else {
      setCotizacionesFiltradas([]);
    }
  }, [formData.cliente_id, cotizaciones]);

  // Actualizar saldo pendiente cuando cambia la cotización o el monto
  useEffect(() => {
    if (formData.cotizacion_id) {
      const cotizacionSeleccionada = cotizaciones.find(c => c._id === formData.cotizacion_id);
      if (cotizacionSeleccionada) {
        setTotalCotizacion(cotizacionSeleccionada.total);
        setFormData(prev => ({
          ...prev,
          saldo_pendiente: cotizacionSeleccionada.total - prev.monto_pago
        }));
      }
    }
  }, [formData.cotizacion_id, formData.monto_pago, cotizaciones]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value) || 0;
    setFormData({ ...formData, [name]: numericValue });
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
      await actualizarPago(id, formData);
      setAlertType("success");
      setAlertMessage("Pago actualizado exitosamente.");
      setShowAlert(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(`/pagos/ver/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error al actualizar el pago:", error);
      setAlertType("error");
      setAlertMessage("Error al actualizar el pago. Verifique los datos e intente nuevamente.");
      setShowAlert(true);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <LoadingError loading={loading} error={error}>
      <Layout>
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h2 className="float-left font-size-h4">Editar Pago #{id}</h2>
                <div className="invoice-title d-flex flex-column align-items-center">
                  <img src="/assets/images/logo-dark.png" alt="logo" height="20" className="logo-dark ms-auto" />
                </div>
                <hr className="my-4" />

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Cliente <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          name="cliente_id"
                          value={formData.cliente_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleccione un cliente</option>
                          {clientes.map(cliente => (
                            <option key={cliente._id} value={cliente._id}>
                              {cliente.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Cotización Relacionada</label>
                        <select
                          className="form-select"
                          name="cotizacion_id"
                          value={formData.cotizacion_id}
                          onChange={handleInputChange}
                          disabled={!formData.cliente_id}
                        >
                          <option value="">Seleccione una cotización</option>
                          {cotizacionesFiltradas.map(cotizacion => (
                            <option key={cotizacion._id} value={cotizacion._id}>
                              #{cotizacion.numero} - Total: {formatCurrency(cotizacion.total)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Fecha de Pago <span className="text-danger">*</span></label>
                        <input
                          type="date"
                          className="form-control"
                          name="fecha_pago"
                          value={formData.fecha_pago}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Tipo de Pago <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          name="tipo_pago"
                          value={formData.tipo_pago}
                          onChange={handleInputChange}
                          required
                        >
                          {tiposPago.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Método de Pago <span className="text-danger">*</span></label>
                        <select
                          className="form-select"
                          name="metodo_pago"
                          value={formData.metodo_pago}
                          onChange={handleInputChange}
                          required
                        >
                          {metodosPago.map(metodo => (
                            <option key={metodo} value={metodo}>{metodo}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Monto del Pago <span className="text-danger">*</span></label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="number"
                            className="form-control"
                            name="monto_pago"
                            value={formData.monto_pago}
                            onChange={handleNumberInputChange}
                            step="0.01"
                            min="0.01"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Saldo Pendiente</label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="text"
                            className="form-control"
                            value={formatCurrency(formData.saldo_pendiente)}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Referencia/Comprobante</label>
                        <input
                          type="text"
                          className="form-control"
                          name="referencia"
                          value={formData.referencia}
                          onChange={handleInputChange}
                          placeholder="Número de transacción o folio"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Observaciones</label>
                    <textarea
                      className="form-control"
                      name="observaciones"
                      rows="3"
                      value={formData.observaciones}
                      onChange={handleInputChange}
                      placeholder="Notas adicionales sobre el pago"
                    />
                  </div>

                  <div className="d-print-none mt-4">
                    <div className="float-end">
                      <button type="submit" className="btn btn-primary w-md waves-effect waves-light">
                        <i className="mdi mdi-content-save me-1"></i> Guardar Cambios
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary w-md waves-effect waves-light ms-2"
                        onClick={() => navigate(`/Lista_pagos`)}
                      >
                        <i className="mdi mdi-close me-1"></i> Cancelar
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
            action={alertType === "success" ? "update" : "error"}
            onCancel={handleAlertClose}
            message={alertMessage}
          />
        )}
      </Layout>
    </LoadingError>
  );
};

export default EditarPago;