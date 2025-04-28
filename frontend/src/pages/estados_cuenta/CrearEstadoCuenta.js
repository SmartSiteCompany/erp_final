import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { useNavigate } from "react-router-dom";
import AlertComponent from "../../components/AlertasComponent";
import EstadoCuentaService from "../../services/EstadoCuentaService";
import ClienteService from "../../services/ClienteService";
import ServiciosFinanciadoService from "../../services/ServicioFinanciadoService";


const CrearEstadoCuenta = ({ onEstadoCuentaCreada }) => {
  const navigate = useNavigate();
  const { crearEstadoCuenta } = EstadoCuentaService();
  const { obtenerClientes } = ClienteService();
  const { obtenerServicioFinanciados} = ServiciosFinanciadoService();
  const [formData, setFormData] = useState({
    fecha_estadocuenta: new Date().toISOString().split('T')[0],
    cliente_id: "", servicio_id: "", saldo_inicial: "", pago_total: "", saldo_actual: "", pago_semanal: "", total_a_pagar: "" 
  });
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const fetchedClientes = await obtenerClientes();
        setClientes(fetchedClientes);
      } catch (err) {
        console.error("Error al obtener clientes:", err);
      }
    };
    fetchClientes();
  }, [obtenerClientes]);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const fetchedServicios = await obtenerServicioFinanciados();
        setServicios(fetchedServicios);
      } catch (err) {
        console.error("Error al obtener Servicios:", err);
      }
    };
    fetchServicios();
  }, [obtenerServicioFinanciados]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearEstadoCuenta(formData);
      setAlertType("success");
      setAlertMessage("Cotización creada exitosamente.");
      setShowAlert(true);
      navigate(`/Estados_Cuenta`);
      setFormData({
        fecha_estado: new Date().toISOString().split('T')[0],
        cliente_id: "", servicio_id: "", saldo_inicial: "", pago_total: "", saldo_actual: "", pago_semanal: "", total_a_pagar: "" 
      
      });
      if (onEstadoCuentaCreada) {
        onEstadoCuentaCreada(formData);
        navigate(`/Estados_Cuenta`);

      }
    } catch (error) {
      console.error("Error al crear la cotización:", error);
      setAlertType("error");
      setAlertMessage("Error al crear la cotización.");
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
                  <h2 className="float-left font-size-h4">Nuevo Estado de Cuenta</h2>
                  <div className="invoice-title d-flex flex-column align-items-center">
                    <img src="/assets/images/logo-dark.png" alt="logo" height="20" className="logo-dark ms-auto" />
                  </div>
                  <hr className="my-4" />
    
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-sm-7">
                      <div className="mb-3">
    <label htmlFor="Servicio" className="form-label">Servicio</label>
    <select
        className="form-select"
        id="servicio_id"
        name="servicio_id"
        value={formData.servicio_id}
        onChange={(e) => setFormData({ ...formData, servicio_id: e.target.value })}
        required
    >
        <option value="">Selecciona un Servicio</option>
        {servicios.map((servicio) => (
            <option key={servicio._id} value={servicio._id}>
                {servicio.nombre_servicio}
            </option>
        ))}
    </select>
</div>

<div className="mb-3">
    <label htmlFor="cliente_id" className="form-label">Cliente</label>
    <select
        className="form-select"
        id="cliente_id"
        name="cliente_id"
        value={formData.cliente_id}
        onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
        required
    >
        <option value="">Selecciona un cliente</option>
        {clientes.map((cliente) => (
            <option key={cliente._id} value={cliente._id}>
                {cliente.nombre}
            </option>
        ))}
    </select>
</div>
                      </div>
                      <div className="col-sm-5">
                      <div className="mb-3">
                          <label htmlFor="fecha_estadocuenta" className="form-label">Fecha</label>
                          <input type="date" className="form-control" id="fecha_estadocuenta" name="fecha_estadocuenta" value={formData.fecha_estadocuenta}  required />
                        </div>

                        </div>
                        <div className="row">
                        <div className="col-md">
                        <div className="mb-2">
                          <label htmlFor="saldo_inicial" className="form-label">Saldo Inicial</label>
                          <input type="number" className="form-control" id="saldo_inicial" name="saldo_inicial" value={formData.saldo_inicial}
                                      onChange={(e) => setFormData({ ...formData, saldo_inicial: e.target.value })} required />
                        </div>
                        </div>
                        <div className="col-md">
                        <div className="mb-2">
                          <label htmlFor="pago_total" className="form-label">Pago Total</label>
                          <input type="number" className="form-control" id="pago_total" name="pago_total" value={formData.pago_total}
                          onChange={(e) => setFormData({ ...formData, pago_total: e.target.value })}
 required />
                        </div></div>
                        </div>
                     
                    </div>
    
                    <div className="py-2">
                      <h5 className="font-size-15">Detalles de la Cotización</h5>
                      <div className="table-responsive">
                        <table className="table table-nowrap table-centered mb-0">
                          <thead>
                            <tr>
                              <th>Saldo Actual</th>
                              <th>Pago Semanal</th>
                              <th>Total a pagar</th>
                            </tr>
                          </thead>
                          <tbody>
                            
                          <tr>
    <td>
        <input
            type="number"
            className="form-control"
            id="saldo_actual"
            name="saldo_actual"
            value={formData.saldo_actual}
            onChange={(e) => setFormData({ ...formData, saldo_actual: e.target.value })}
            required
        />
    </td>
    <td>
        <input
            type="number"
            className="form-control"
            id="pago_semanal"
            name="pago_semanal"
            value={formData.pago_semanal}
            onChange={(e) => setFormData({ ...formData, pago_semanal: e.target.value })}
            required
        />
    </td>
    <td>
        <input
            type="number"
            className="form-control"
            id="total_a_pagar"
            name="total_a_pagar"
            value={formData.total_a_pagar}
            onChange={(e) => setFormData({ ...formData, total_a_pagar: e.target.value })}
            required
        />
    </td>
</tr>
                            
                          </tbody>
                        </table>
                      </div>
                    </div>
    
                    <div className="d-print-none mt-4">
                      <div className="float-end">
                        <button type="submit" className="btn btn-primary w-md waves-effect waves-light">Crear Estado Cuenta</button>
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
              action={alertType === "success" ? "create" : "error"}
              onCancel={handleAlertClose}
              message={alertMessage}
            />
          )}
        </Layout>
      );
    };
    
    export default CrearEstadoCuenta;