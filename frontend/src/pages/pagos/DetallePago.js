import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import PagoService from "../../services/PagoService";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AlertComponent from "../../components/AlertasComponent";

const DetallePago = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { obtenerPagoPorId, eliminarPago, loading, error } = PagoService();
  const [pago, setPago] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchPago = async () => {
      try {
        const fetchedPago = await obtenerPagoPorId(id);
        setPago(fetchedPago);
      } catch (err) {
        console.error("Error al obtener pago:", err);
        setAlertType("error");
        setAlertMessage("No se pudo cargar la información del pago.");
        setShowAlert(true);
      }
    };
    fetchPago();
  }, [id]);


  const confirmDelete = () => {
    setAlertType("warning");
    setAlertMessage("¿Estás seguro de que deseas eliminar este pago?");
    setShowAlert(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No definida";
    const date = new Date(dateString);
    return format(date, "PPP", { locale: es });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <LoadingError
      loading={loading}
      error={error}
      loadingMessage="Cargando datos del pago..."
      errorMessage={error?.message || "Error al cargar los detalles del pago."}
    >
      <Layout>
        {showAlert && (
          <AlertComponent
            type={alertType}
            entity="Pago"
            action={alertType === "warning" ? "delete" : alertType === "success" ? "delete" : "error"}
            message={alertMessage}
            onCancel={() => setShowAlert(false)}
          />
        )}

        {pago && (
          <div className="row">
            <div className="col-lg-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  {/* Encabezado */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h3 className="mb-0 text-primary">
                        <i className="bx bx-credit-card me-2"></i>
                        COMPROBANTE DE PAGO
                      </h3>
                      <small className="text-muted">Referencia: {pago.referencia || 'N/A'}</small>
                    </div>
                    <div className="text-end">
                      <img 
                        src="/assets/images/logo-dark.png" 
                        alt="Logo" 
                        style={{ height: '30px' }}
                      />
                      <p className="text-muted mb-0 small">
                        <i className="bx bx-calendar me-1"></i>
                        Fecha: {formatDate(pago.fecha_pago)}
                      </p>
                    </div>
                  </div>

                  {/* Información básica */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="border p-3 rounded">
                        <h5 className="mb-3 text-uppercase text-muted small">CLIENTE</h5>
                        <h4 className="mb-1">
                          {pago.cliente_id?.nombre || "No especificado"}
                        </h4>
                        <p className="text-muted mb-0">
                          <i className="bx bx-id-card me-1"/>
                          {pago.cliente_id?.correo|| "No especificado"}
                        </p>
                        <p className="text-muted mb-0">
                          <i className="bx bx-id-card me-1"/>
                          {pago.cliente_id?.telefono|| "No especificado"}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="border p-3 rounded">
                        <h5 className="mb-3 text-uppercase text-muted small">COTIZACIÓN RELACIONADA</h5>
                        {pago.cotizacion_id ? (
                          <>
                            <h4 className="mb-1">
                              <Link to={`/cotizaciones/ver/${pago.cotizacion_id._id}`}>
                                #{pago.cotizacion_id._id}
                              </Link>
                            </h4>
                            <p className="text-muted mb-0">
                              <i className="bx bx-money me-1"/>
                              Total: {formatCurrency(pago.cotizacion_id?.precio_venta)}
                            </p>
                          </>
                        ) : (
                          <p className="text-muted">No asociada a cotización</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalles del pago */}
                  <div className="mb-4 col-md">
                    <h5 className="mb-3 text-uppercase border-bottom pb-2">
                      <i className="bx bx-detail me-2"></i>
                      Detalles del Pago
                    </h5>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <div className="border p-2 rounded text-center">
                          <h6 className="text-muted small">MONTO PAGADO</h6>
                          <h3 className="text-success">
                            {formatCurrency(pago.monto_pago)}
                          </h3>
                        </div>
                      </div>
                      <div className="col-md-6 mb-2">
                        <div className="border p-2 rounded text-center">
                          <h6 className="text-muted small">SALDO PENDIENTE</h6>
                          <h3 className={pago.saldo_pendiente > 0 ? "text-warning" : "text-success"}>
                            {formatCurrency(pago.saldo_pendiente)}
                          </h3>
                        </div>
                      </div>
                      <div className="col-md-6 mb-2">
                      <div className="border p-3 rounded text-center">
                        <h6 className="text-muted small">TIPO DE PAGO</h6>
                          <span className={`badge ${
                            pago.tipo_pago === 'Contado' ? 'bg-info font-size-12' :
                            pago.tipo_pago === 'Financiado' ? 'bg-primary font-size-12' :
                            'bg-secondary font-size-12'
                          }`}>
                            {pago.tipo_pago}
                          </span>
                        </div>
                      </div>
                       <div className="col-md-6 mb-2">
                        <div className="border p-3 rounded text-center">
                          <h6 className="text-muted small">MÉTODO</h6>
                          <span className={`badge ${
                            pago.metodo_pago === 'Efectivo' ? 'bg-success font-size-12' :
                            pago.metodo_pago === 'Tarjeta' ? 'bg-warning font-size-12' :
                            'bg-light text-dark font-size-12'
                          }`}>
                            {pago.metodo_pago}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="border p-3 rounded">
                        <h5 className="mb-3 text-uppercase text-muted small">INFORMACIÓN ADICIONAL</h5>
                        <div className="table-responsive">
                          <table className="table table-sm table-borderless">
                            <tbody>
                              <tr>
                                <th width="40%">Registrado el:</th>
                                <td>{formatDate(pago.createdAt)}</td>
                              </tr>
                              <tr>
                                <th>Última actualización:</th>
                                <td>{formatDate(pago.updatedAt)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="border p-3 rounded h-100">
                        <h5 className="mb-3 text-uppercase text-muted small">OBSERVACIONES</h5>
                        {pago.observaciones ? (
                          <p className="mb-0">{pago.observaciones}</p>
                        ) : (
                          <p className="text-muted mb-0">No hay observaciones registradas</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      <Link to="/Lista_pagos" className="btn btn-primary mb-2">
                        <i className="bx bx-arrow-back me-1"></i>  Volver
                      </Link>

                    </div>
                    <div>
                      <Link 
                        to={`/pagos/editar/${pago._id}`} 
                        className="btn btn-outline-primary me-2 mb-2"
                      >
                        <i className="bx bx-edit me-1"></i> Editar
                      </Link>
                      <button onClick={() => window.print()} className="btn btn-success mb-2">
                        <i className="bx bx-printer me-1"></i> Imprimir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </LoadingError>
  );
};

export default DetallePago;