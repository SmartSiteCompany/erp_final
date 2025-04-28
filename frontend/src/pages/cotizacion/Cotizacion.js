import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import CotizacionService from "../../services/CotizacionService";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DetalleCotizacion = () => {
  const { id } = useParams();
  const { obtenerCotizacionPorId, loading, error } = CotizacionService();
  const [cotizacion, setCotizacion] = useState(null);

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const fetchedCotizacion = await obtenerCotizacionPorId(id);
        setCotizacion(fetchedCotizacion);
      } catch (err) {
        console.error("Error al obtener cotización:", err);
      }
    };
    fetchCotizacion();
  }, [id]);

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
      loadingMessage="Cargando datos de la cotización..."
      errorMessage={error?.message || "Error al cargar los detalles de la cotización."}
    >
      <Layout>
        {cotizacion && (
          <div className="row">
            <div className="col-lg-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  {/* Encabezado */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h2 className="mb-0 text-primary">
                        <i className="bx bx-file me-2"></i>
                        COTIZACIÓN
                      </h2>
                      <small className="text-muted">N° {cotizacion._id}</small>
                    </div>
                    <div className="text-end">
                      <img 
                        src="/assets/images/logo-dark.png" 
                        alt="Logo" 
                        style={{ height: '40px' }}
                      />
                      <p className="text-muted mb-0 small">
                        <i className="bx bx-calendar me-1"></i>
                        {formatDate(cotizacion.fecha_cotizacion)}
                      </p>
                      <p className="text-muted mb-0 small">
                        <i className="bx bx-calendar me-1"></i>
                        Válido hasta: {formatDate(cotizacion.validoHasta)}
                      </p>
                    </div>
                  </div>

                  {/* Información básica */}
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="border p-3 rounded">
                        <h5 className="mb-3 text-uppercase text-muted small">CLIENTE</h5>
                        <h4 className="mb-1">{cotizacion.cliente_id?.nombre || "No especificado"}</h4>
                        <p className="text-muted mb-0">
                          <i className="bx bx-buildings me-1"/>
                          {cotizacion.filial_id?.nombre_filial || "No especificado"}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="border p-3 rounded">
                        <h5 className="mb-3 text-uppercase text-muted small">VENDEDOR</h5>
                        <h4 className="mb-1">{cotizacion.vendedor || "No especificado"}</h4>
                        <div className="d-flex justify-content-between">
                          <span className={`badge ${
                            cotizacion.estado === "Completada" ? "bg-success" : 
                            cotizacion.estado === "Aprobada" ? "bg-primary" : 
                            cotizacion.estado === "Enviada" ? "bg-info" : "bg-secondary"
                          }`}>
                            {cotizacion.estado}
                          </span>
                          <span className="text-muted small">
                            {cotizacion.aplicaIva ? "Con IVA" : "Sin IVA"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalles de productos */}
                  <div className="mb-4">
                    <h5 className="mb-3 text-uppercase border-bottom pb-2">
                      <i className="bx bx-list-ul me-2"></i>
                      Detalles de Productos/Servicios
                    </h5>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th width="40%">DESCRIPCIÓN</th>
                            <th className="text-end">MATERIALES</th>
                            <th className="text-end">MANO DE OBRA</th>
                            <th className="text-end">UTILIDAD %</th>
                            <th className="text-end">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cotizacion.detalles.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <strong>{item.descripcion}</strong>
                              </td>
                              <td className="text-end">{formatCurrency(item.costo_materiales)}</td>
                              <td className="text-end">{formatCurrency(item.costo_mano_obra)}</td>
                              <td className="text-end">{item.utilidad_esperada}%</td>
                              <td className="text-end fw-bold">{formatCurrency(item.inversion)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totales */}
                  <div className="row justify-content-end mb-4">
                    <div className="col-md-5">
                      <div className="border p-3 bg-light rounded">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(cotizacion.subtotal)}</span>
                        </div>
                        {cotizacion.aplicaIva && (
                          <div className="d-flex justify-content-between mb-2">
                            <span>IVA (16%):</span>
                            <span>{formatCurrency(cotizacion.iva)}</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-2">
                          <span>TOTAL:</span>
                          <span>{formatCurrency(cotizacion.precio_venta)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Condiciones de pago */}
                  <div className="mb-4">
                    <h5 className="mb-3 text-uppercase border-bottom pb-2">
                      <i className="bx bx-credit-card me-2"></i>
                      Condiciones de Pago
                    </h5>
                    {cotizacion.forma_pago === "Financiado" ? (
                      <div className="row">
                        <div className="col-md-3">
                          <div className="border p-2 rounded text-center">
                            <h6 className="text-muted small">ANTICIPO</h6>
                            <h4 className="text-primary">
                              {formatCurrency(cotizacion.financiamiento?.anticipo_solicitado)}
                            </h4>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="border p-2 rounded text-center">
                            <h6 className="text-muted small">SALDO</h6>
                            <h4 className="text-primary">
                              {formatCurrency(cotizacion.financiamiento?.saldo_restante)}
                            </h4>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="border p-2 rounded text-center">
                            <h6 className="text-muted small">PAGO SEMANAL</h6>
                            <h4 className="text-primary">
                              {formatCurrency(cotizacion.financiamiento?.pago_semanal)}
                            </h4>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="border p-2 rounded text-center">
                            <h6 className="text-muted small">PLAZO</h6>
                            <h4 className="text-primary">
                              {cotizacion.financiamiento?.plazo_semanas} semanas
                            </h4>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-primary">
                        <i className="bx bx-money me-2"></i>
                        Pago de contado al momento de la entrega
                        {cotizacion.pagoContado?.fechaPago && (
                          <span> - Fecha límite: {formatDate(cotizacion.pagoContado.fechaPago)}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Fechas de servicio */}
                  <div className="mb-4">
                    <h5 className="mb-3 text-uppercase border-bottom pb-2">
                      <i className="bx bx-calendar me-2"></i>
                      Fechas de Servicio
                    </h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="border p-3 rounded">
                          <h6 className="text-muted small">INICIO</h6>
                          <h4 className="mb-0">
                            {formatDate(cotizacion.fecha_inicio_servicio)}
                          </h4>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="border p-3 rounded">
                          <h6 className="text-muted small">TÉRMINO</h6>
                          <h4 className="mb-0">
                            {formatDate(cotizacion.fecha_fin_servicio)}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estado del servicio */}
                  <div className="alert alert-warning">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">
                          <i className="bx bx-task me-2"></i>
                          Estado del Servicio
                        </h5>
                        <span className={`badge ${
                          cotizacion.estado_servicio === "Completado" ? "bg-success" : 
                          cotizacion.estado_servicio === "En Proceso" ? "bg-warning" : "bg-secondary"
                        }`}>
                          {cotizacion.estado_servicio}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center">
                    <Link to="/Lista_cotizacion" className="btn btn-primary">
                      <i className="bx bx-arrow-back me-1"></i> Volver
                    </Link>
                    <button onClick={() => window.print()} className="btn btn-outline-primary me-2">
                      <i className="bx bx-printer me-1"></i> Imprimir
                    </button>
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

export default DetalleCotizacion;