import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import AlertComponent from "../../components/AlertasComponent";
import EventoService from "../../services/EventoService";
import ClienteService from "../../services/ClienteService";
import LoadingError from "../../components/LoadingError";

const EditarEvento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { obtenerEventoPorId, actualizarEvento, loading, error } = EventoService();
  const { obtenerClientes } = ClienteService();
  
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha: new Date().toISOString().split('T')[0],
    ubicacion: "",
    clientes: []
  });
  
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
  const [mostrarSelectorClientes, setMostrarSelectorClientes] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Primero obtenemos los clientes disponibles
        const fetchedClientes = await obtenerClientes();
        setClientesDisponibles(fetchedClientes);

        // Luego obtenemos el evento
        const evento = await obtenerEventoPorId(id);
        
        // Normalizamos los IDs de los clientes (pueden venir como objetos o strings)
        const clientesNormalizados = evento.clientes.map(cliente => 
          typeof cliente === 'object' ? cliente._id.toString() : cliente.toString()
        );

        setFormData({
          nombre: evento.nombre,
          descripcion: evento.descripcion,
          fecha: new Date(evento.fecha).toISOString().split('T')[0],
          ubicacion: evento.ubicacion,
          clientes: clientesNormalizados
        });
        
        setClientesSeleccionados(clientesNormalizados);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFechaChange = (e) => {
    setFormData({ ...formData, fecha: e.target.value });
  };

  const toggleSelectorClientes = () => {
    setMostrarSelectorClientes(!mostrarSelectorClientes);
  };

  const handleClienteSeleccionado = (clienteId) => {
    const clienteIdStr = clienteId.toString();
    setClientesSeleccionados(prev => {
      if (prev.some(id => id.toString() === clienteIdStr)) {
        return prev.filter(id => id.toString() !== clienteIdStr);
      } else {
        return [...prev, clienteId];
      }
    });
  };

  useEffect(() => {
    setFormData(prev => ({ ...prev, clientes: clientesSeleccionados }));
  }, [clientesSeleccionados]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarEvento(id, formData);
      setAlertType("success");
      setAlertMessage("Evento actualizado exitosamente.");
      setShowAlert(true);
      setTimeout(() => navigate("/Lista_Eventos"), 2000);
    } catch (error) {
      console.error("Error al actualizar el evento:", error);
      setAlertType("error");
      setAlertMessage("Error al actualizar el evento.");
      setShowAlert(true);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };


  return (
    <LoadingError
      loading={loading}
      error={error}
      loadingMessage="Cargando datos del evento..."
      errorMessage={error?.message || "Error al cargar el evento."}
    >
      <Layout>
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
              <div className="invoice-title d-flex justify-content-between align-items-center">
               <h3 className="font-size-h4">Editar Evento</h3>
                  <div className="mb-6">
                    <img src="/assets/images/logo-dark.png" alt="logo" height="25" className="logo-dark" />  
                    <img src="/assets/images/logo-light.png" alt="logo" height="25" className="logo-light" />
                  </div>
                </div>
                <hr className="my-4" />

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label">Descripción <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="fecha" className="form-label">Fecha <span className="text-danger">*</span></label>
                        <input
                          type="date"
                          className="form-control"
                          id="fecha"
                          name="fecha"
                          value={formData.fecha}
                          onChange={handleFechaChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="ubicacion" className="form-label">Ubicación <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          id="ubicacion"
                          name="ubicacion"
                          value={formData.ubicacion}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Seleccionar Clientes</label>
                    <button
                      type="button"
                      className="btn btn-outline-info mb-2"
                      onClick={toggleSelectorClientes}
                    >
                      {mostrarSelectorClientes ? 'Ocultar Clientes' : 'Mostrar Clientes'}
                    </button>
                    
                    {mostrarSelectorClientes && (
                      <div className="border p-3 rounded">
                        <ul className="list-unstyled" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {clientesDisponibles.map(cliente => (
                            <li key={cliente._id}>
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id={`cliente-${cliente._id}`}
                                  checked={clientesSeleccionados.includes(cliente._id)}
                                  onChange={() => handleClienteSeleccionado(cliente._id)}
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
                                type="button"
                                className="btn btn-sm btn-outline-danger"
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
                      <button type="submit" className="btn btn-primary w-md waves-effect waves-light me-2">
                        Actualizar Evento
                      </button>
                      <Link to="/Lista_Eventos" className="btn btn-secondary waves-effect waves-light">
                        Cancelar
                      </Link>
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
            entity="Evento"
            action={alertType === "success" ? "update" : "error"}
            onCancel={handleAlertClose}
            message={alertMessage}
          />
        )}
      </Layout>
    </LoadingError>
  );
};

export default EditarEvento;