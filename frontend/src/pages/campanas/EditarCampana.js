import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import CampanaService from "../../services/CampanaService";
import ClienteService from "../../services/ClienteService";

const EditarCampana = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { obtenerCampanaPorId, actualizarCampana, loading, error } = CampanaService();
  const { obtenerClientes } = ClienteService();
  const [campana, setCampana] = useState({
    nombre: "",
    descripcion: "",
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0],
    estado: "activa",
    clientes: []
  });
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener campaña por ID
        const campanaData = await obtenerCampanaPorId(id);
        setCampana(campanaData);
        
        // Obtener lista de clientes
        const clientes = await obtenerClientes();
        setClientesDisponibles(clientes);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampana({ ...campana, [name]: value });
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setCampana({ ...campana, [name]: new Date(value).toISOString() });
  };

  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    const cliente = clientesDisponibles.find(c => c._id === clienteId);
    setClienteSeleccionado(cliente);
  };

  const agregarCliente = () => {
    if (clienteSeleccionado && !campana.clientes.some(c => c._id === clienteSeleccionado._id)) {
      setCampana({
        ...campana,
        clientes: [...campana.clientes, clienteSeleccionado]
      });
    }
  };

  const eliminarCliente = (clienteId) => {
    setCampana({
      ...campana,
      clientes: campana.clientes.filter(c => c._id !== clienteId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarCampana(id, campana);
      navigate("/campanas");
    } catch (err) {
      console.error("Error al actualizar campaña:", err);
    }
  };

  return (
    <LoadingError
      loading={loading}
      error={error}
      loadingMessage="Cargando datos de la campaña..."
      errorMessage={error?.message || "Error al cargar los detalles de la campaña."}
    >
      <Layout>
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Editar Campaña</h4>
                <form onSubmit={handleSubmit}>
                  {/* Información básica de la campaña */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nombre"
                        value={campana.nombre}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Estado</label>
                      <select
                        className="form-select"
                        name="estado"
                        value={campana.estado}
                        onChange={handleChange}
                      >
                        <option value="activa">Activa</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Fecha de Inicio</label>
                      <input
                        type="date"
                        className="form-control"
                        name="fecha_inicio"
                        value={campana.fecha_inicio ? new Date(campana.fecha_inicio).toISOString().split('T')[0] : ""}
                        onChange={handleDateChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Fecha de Fin</label>
                      <input
                        type="date"
                        className="form-control"
                        name="fecha_fin"
                        value={campana.fecha_fin ? new Date(campana.fecha_fin).toISOString().split('T')[0] : ""}
                        onChange={handleDateChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      name="descripcion"
                      rows="3"
                      value={campana.descripcion}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Gestión de clientes */}
                  <div className="mb-3">
                    <h5 className="font-size-15">Clientes Inscritos</h5>
                    <div className="row mb-3">
                      <div className="col-md-8 mb-2">
                        <select
                          className="form-select"
                          onChange={handleClienteChange}
                          value={clienteSeleccionado?._id || ""}
                        >
                          <option value="">Seleccionar cliente...</option>
                          {clientesDisponibles.map(cliente => (
                            <option key={cliente._id} value={cliente._id}>
                              {cliente.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4">
                        <button
                          type="button"
                          className="btn btn-primary w-100"
                          onClick={agregarCliente}
                          disabled={!clienteSeleccionado}
                        >
                          Agregar Cliente
                        </button>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-nowrap table-centered mb-0">
                        <thead>
                          <tr>
                            <th>No.</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campana.clientes && campana.clientes.length > 0 ? (
                            campana.clientes.map((cliente, index) => (
                              <tr key={cliente._id}>
                                <th scope="row">{index + 1}</th>
                                <td>{cliente.nombre}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => eliminarCliente(cliente._id)}
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="text-center">
                                No hay clientes inscritos en esta campaña.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="d-flex justify-content-between mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate("/campanas")}
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

export default EditarCampana;