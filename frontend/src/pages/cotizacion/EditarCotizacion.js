import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import AlertComponent from "../../components/AlertasComponent";
import CotizacionService from "../../services/CotizacionService";
import ClienteService from "../../services/ClienteService";
import FilialService from "../../services/FilialService";
import LoadingError from "../../components/LoadingError";

const EditarCotizacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { obtenerCotizacionPorId, actualizarCotizacion } = CotizacionService();
  const { obtenerClientes } = ClienteService();
  const { obtenerFilials } = FilialService();
  
  const [formData, setFormData] = useState({
    nombre_cotizacion: "",
    fecha_cotizacion: new Date().toISOString().split('T')[0],
    valido_hasta: "",
    estado: "",
    aplicaIva: true, // Nuevo campo para controlar IVA
    cliente_id: "",
    vendedor: "",
    filial_id: "",
    detalles: [{
      descripcion: "", costo_materiales: 0, costo_mano_obra: 0, utilidad_esperada: 0, inversion: 0
    }],
    subtotal: 0,
    iva: 0,
    precio_venta: 0,
    forma_pago: "",
    financiamiento: {
      anticipo_solicitado: 0, plazo_semanas: 0, pago_semanal: 0, saldo_restante: 0,
    },
    pagoContado: {
      fechaPago: ""
    },
    fecha_inicio_servicio: "",
    fecha_fin_servicio: "",
    estado_servicio: "Pendiente"
  });

  const [clientes, setClientes] = useState([]);
  const [filials, setFilials] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const formasPago = ["Contado", "Financiado"];
  const estados = ["Borrador", "Enviada", "Aprobada", "Completada", "Cancelada"];
  const estadosServicio = ["Pendiente", "En Proceso", "Completado", "Cancelado"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener cotización existente
        const cotizacion = await obtenerCotizacionPorId(id);
        setFormData({
          ...cotizacion,
          cliente_id: cotizacion.cliente_id?._id || "",
          filial_id: cotizacion.filial_id?._id || "",
          fecha_cotizacion: cotizacion.fecha_cotizacion?.split('T')[0] || new Date().toISOString().split('T')[0],
          valido_hasta: cotizacion.valido_hasta?.split('T')[0] || "",
          fecha_inicio_servicio: cotizacion.fecha_inicio_servicio?.split('T')[0] || "",
          fecha_fin_servicio: cotizacion.fecha_fin_servicio?.split('T')[0] || "",
          pagoContado: {
            ...cotizacion.pagoContado,
            fechaPago: cotizacion.pagoContado?.fechaPago?.split('T')[0] || ""
          },
          financiamiento: {
            ...cotizacion.financiamiento,
            fecha_inicio: cotizacion.financiamiento?.fecha_inicio?.split('T')[0] || "",
            fecha_termino: cotizacion.financiamiento?.fecha_termino?.split('T')[0] || ""
          },
          aplicaIva: cotizacion.aplicaIva !== undefined ? cotizacion.aplicaIva : true // Establecer valor por defecto si no existe
        });
        
        // Obtener clientes y filiales
        const [clientesData, filialsData] = await Promise.all([
          obtenerClientes(),
          obtenerFilials()
        ]);
        
        setClientes(clientesData);
        setFilials(filialsData);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    
    // Manejar el checkbox de IVA
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked,
        // Recalcular IVA y precio de venta
        iva: checked ? formData.subtotal * 0.16 : 0,
        precio_venta: checked ? formData.subtotal * 1.16 : formData.subtotal
      });
      return;
    }
    
    if (name.startsWith("financiamiento.")) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        financiamiento: {
          ...formData.financiamiento,
          [field]: value || (field === 'anticipo_solicitado' || field === 'plazo_semanas' ? 0 : "")
        }
      });
    } else if (name.startsWith("pagoContado.")) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        pagoContado: {
          ...formData.pagoContado,
          [field]: value || ""
        }
      });
    } else if (index !== undefined) {
      // Manejo de detalles
      const detalles = formData.detalles.map((item, i) => {
        if (i === index) {
          const updatedItem = { 
            ...item, 
            [name]: name === 'descripcion' ? value : parseFloat(value) || 0 
          };
          // Calcular inversión del item
          updatedItem.inversion = updatedItem.costo_materiales + updatedItem.costo_mano_obra;
          return updatedItem;
        }
        return item;
      });
      
      // Calcular subtotal, IVA y precio_venta
      const subtotal = detalles.reduce((sum, item) => sum + (item.inversion || 0), 0);
      const iva = formData.aplicaIva ? subtotal * 0.16 : 0;
      const precio_venta = subtotal + iva;
      
      // Si es financiado, recalcular saldo
      let financiamiento = formData.financiamiento;
      if (formData.forma_pago === "Financiado") {
        const saldo = precio_venta - (financiamiento.anticipo_solicitado || 0);
        const pagoSemanal = saldo / (financiamiento.plazo_semanas || 1);
        
        financiamiento = {
          ...financiamiento,
          saldo_restante: saldo, 
          pago_semanal: pagoSemanal
        };
      }
      
      setFormData({ 
        ...formData, 
        detalles,  
        subtotal,  
        iva, 
        precio_venta, 
        financiamiento
      });
    } else {
      setFormData({ ...formData, [name]: value || "" });
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      detalles: [
        ...formData.detalles,
        { 
          descripcion: "", 
          costo_materiales: 0, 
          costo_mano_obra: 0,  
          utilidad_esperada: 0, 
          inversion: 0 
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    const detalles = [...formData.detalles];
    detalles.splice(index, 1);
    
    // Recalcular totales
    const subtotal = detalles.reduce((sum, item) => sum + (item.inversion || 0), 0);
    const iva = formData.aplicaIva ? subtotal * 0.16 : 0;
    const precio_venta = subtotal + iva;
    
    setFormData({ 
      ...formData, 
      detalles, 
      subtotal, 
      iva, 
      precio_venta 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Normalize data before sending
      const dataToSend = {
        ...formData,
        valido_hasta: formData.valido_hasta || "",
        fecha_cotizacion: formData.fecha_cotizacion || new Date().toISOString().split('T')[0],
        fecha_inicio_servicio: formData.fecha_inicio_servicio || "",
        fecha_fin_servicio: formData.fecha_fin_servicio || "",
        financiamiento: {
          anticipo_solicitado: Number(formData.financiamiento.anticipo_solicitado) || 0,
          plazo_semanas: Number(formData.financiamiento.plazo_semanas) || 0,
          pago_semanal: Number(formData.financiamiento.pago_semanal) || 0,
          saldo_restante: Number(formData.financiamiento.saldo_restante) || 0,
          fecha_inicio: formData.financiamiento.fecha_inicio || "",
          fecha_termino: formData.financiamiento.fecha_termino || ""
        },
        pagoContado: {
          fechaPago: formData.pagoContado.fechaPago || ""
        }
      };
      await actualizarCotizacion(id, dataToSend);
      setAlertType("success");
      setAlertMessage("Cotización actualizada exitosamente.");
      setShowAlert(true);
      
      // Redirigir después de 5 segundos
      setTimeout(() => {
        navigate(`/cotizacion/ver/${id}`);
      }, 5000);
      
    } catch (error) {
      console.error("Error al actualizar la cotización:", error);
      setAlertType("error");
      setAlertMessage("Error al actualizar la cotización.");
      setShowAlert(true);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <LoadingError loading={loading} error={error}>
      <Layout>
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h2 className="float-left font-size-h4">Editar Cotización #{id}</h2>
                <div className="invoice-title d-flex flex-column align-items-center">
                  <img src="/assets/images/logo-dark.png" alt="logo" height="20" className="logo-dark ms-auto" />
                </div>
                <hr className="my-4" />

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Título de Cotización</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="nombre_cotizacion" 
                          value={formData.nombre_cotizacion} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Fecha</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          name="fecha_cotizacion" 
                          value={formData.fecha_cotizacion} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label">Válido hasta</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          name="validoHasta" 
                          value={formData.validoHasta} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Forma de Pago</label>
                        <select 
                          className="form-select" 
                          name="forma_pago" 
                          value={formData.forma_pago} 
                          onChange={handleChange} 
                          required
                        >
                          <option value="">Selecciona una opción</option>
                          {formasPago.map(forma => (
                            <option key={forma} value={forma}>{forma}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Filial</label>
                        <select 
                          className="form-select" 
                          name="filial_id" 
                          value={formData.filial_id} 
                          onChange={handleChange} 
                          required
                        >
                          <option value="">Selecciona una filial</option>
                          {filials.map(filial => (
                            <option key={filial._id} value={filial._id}>
                              {filial.nombre_filial}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Estado</label>
                        <select 
                          className="form-select" 
                          name="estado" 
                          value={formData.estado} 
                          onChange={handleChange} 
                          required
                        >
                          {estados.map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Cliente</label>
                        <select 
                          className="form-select" 
                          name="cliente_id" 
                          value={formData.cliente_id} 
                          onChange={handleChange} 
                          required
                        >
                          <option value="">Selecciona un cliente</option>
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
                        <label className="form-label">Vendedor</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="vendedor" 
                          value={formData.vendedor} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-md-4">
                      <div className="form-check mb-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="aplicaIva"
                          checked={formData.aplicaIva}
                          onChange={handleChange}
                          id="aplicaIvaCheck"
                        />
                        <label className="form-check-label" htmlFor="aplicaIvaCheck">
                          Aplicar IVA (16%)
                        </label>
                      </div>
                    </div>
                  </div>

                  {formData.forma_pago === "Financiado" && (
                    <div className="row mt-3">
                      <div className="col-md-12">
                        <h5>Datos de Financiamiento</h5>    
                        <div className="row">
                          <div className="col-md-3">
                            <div className="mb-3">
                              <label className="form-label">Anticipo</label>
                              <input 
                                type="number" 
                                className="form-control" 
                                name="financiamiento.anticipo_solicitado" 
                                value={formData.financiamiento.anticipo_solicitado} 
                                onChange={handleChange} 
                                step="0.01" 
                              />
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="mb-3">
                              <label className="form-label">Plazo (semanas)</label>
                              <input 
                                type="number" 
                                className="form-control" 
                                name="financiamiento.plazo_semanas" 
                                value={formData.financiamiento.plazo_semanas} 
                                onChange={handleChange} 
                              />
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="mb-3">
                              <label className="form-label">Pago Semanal</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                value={formatCurrency(formData.financiamiento.pago_semanal)} 
                                disabled 
                              />
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="mb-3">
                              <label className="form-label">Saldo Restante</label>
                              <input 
                                type="text" 
                                className="form-control" 
                                value={formatCurrency(formData.financiamiento.saldo_restante)} 
                                disabled 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.forma_pago === "Contado" && (
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Fecha de Pago</label>
                          <input 
                            type="date" 
                            className="form-control" 
                            name="pagoContado.fechaPago" 
                            value={formData.pagoContado.fechaPago} 
                            onChange={handleChange} 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="py-2 mt-3">
                    <h5 className="font-size-15">Detalles de la Cotización</h5>
                    <div className="table-responsive">
                      <table className="table table-nowrap table-centered mb-0">
                        <thead>
                          <tr>
                            <th>Descripción</th>
                            <th>Costo Materiales</th>
                            <th>Costo Mano Obra</th>
                            <th>Utilidad Esperada</th>
                            <th>Inversión Total</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.detalles.map((item, index) => (
                            <tr key={index}>
                              <td>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  name="descripcion" 
                                  value={item.descripcion} 
                                  onChange={(e) => handleChange(e, index)} 
                                  required 
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  name="costo_materiales" 
                                  value={item.costo_materiales} 
                                  onChange={(e) => handleChange(e, index)} 
                                  step="0.01" 
                                  min="0" 
                                  required 
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  name="costo_mano_obra" 
                                  value={item.costo_mano_obra} 
                                  onChange={(e) => handleChange(e, index)} 
                                  step="0.01" 
                                  min="0" 
                                  required 
                                />
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  name="utilidad_esperada" 
                                  value={item.utilidad_esperada} 
                                  onChange={(e) => handleChange(e, index)} 
                                  step="0.01" 
                                  min="0" 
                                />
                              </td>
                              <td>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  value={formatCurrency(item.inversion)} 
                                  disabled 
                                />
                              </td>
                              <td>
                                <button 
                                  type="button" 
                                  className="btn btn-danger btn-sm" 
                                  onClick={() => handleRemoveItem(index)}
                                  disabled={formData.detalles.length <= 1}
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-primary mt-2" 
                      onClick={handleAddItem}
                    >
                      Agregar Detalle
                    </button>
                  </div>

                  <div className="row mt-3">
                    <div className="col-md-4 offset-md-8">
                      <div className="table-responsive">
                        <table className="table table-sm table-borderless">
                          <tbody>
                            <tr>
                              <th>Subtotal:</th>
                              <td className="text-end">{formatCurrency(formData.subtotal)}</td>
                            </tr>
                            {formData.aplicaIva && (
                              <tr>
                                <th>IVA (16%):</th>
                                <td className="text-end">{formatCurrency(formData.iva)}</td>
                              </tr>
                            )}
                            <tr className="border-top">
                              <th>Total:</th>
                              <td className="text-end fw-bold">{formatCurrency(formData.precio_venta)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="d-print-none mt-4">
                    <div className="float-end">
                      <button type="submit" className="btn btn-primary w-md waves-effect waves-light">
                        Guardar Cambios
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary w-md waves-effect waves-light ms-2"
                        onClick={() => navigate(`/detalle-cotizacion/${id}`)}
                      >
                        Cancelar
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
            entity="Cotización"
            action={alertType === "success" ? "update" : "error"}
            onCancel={handleAlertClose}
            message={alertMessage}
          />
        )}
      </Layout>
    </LoadingError>
  );
};

export default EditarCotizacion;