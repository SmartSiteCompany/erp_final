import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import InteraccionService from "../../services/InteraccionService";
import ClienteService from "../../services/ClienteService";
import UserService from "../../services/UserService";

const DetalleInteraccion = () => {
  const { id } = useParams();
  const { error, obtenerInteraccionPorId } = InteraccionService();
  const { obtenerClientePorId } = ClienteService();
  const { obtenerUsuarios } = UserService;
  const [interaccion, setInteraccion] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await obtenerUsuarios();
        const map = {};
        users.forEach(user => {
          map[user._id] = user;
        });
        setUsersMap(map);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const foundInteraccion = await obtenerInteraccionPorId(id);

        if (!foundInteraccion) {
          setNotFound(true);
          return;
        }

        setInteraccion(foundInteraccion);

        // Obtener cliente
        if (foundInteraccion.cliente_id) {
          const clienteData = typeof foundInteraccion.cliente_id === "object"
            ? foundInteraccion.cliente_id
            : await obtenerClientePorId(foundInteraccion.cliente_id);
          setCliente(clienteData);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Función para formatear fecha (mantenemos la original)
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Estilos para estados (versión original)
  const getEstadoStyle = (estado) => {
    switch(estado) {
      case 'completada': return 'badge bg-success';
      case 'pendiente': return 'badge bg-warning text-dark';
      case 'cancelada': return 'badge bg-danger';
      default: return 'badge bg-secondary';
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

  return (
    <LoadingError
      loading={loading}
      error={error}
      loadingMessage="Cargando datos..."
      errorMessage={error?.message}
    >
      <Layout>
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="invoice-title">
                  <h4 className="float-end font-size-16">ID: #{interaccion?._id}</h4>
                  <div className="mb-4">
                    <img
                      src="/assets/images/logo-dark.png"
                      alt="logo"
                      height="20"
                      className="logo-dark"
                    />
                    <img
                      src="/assets/images/logo-light.png"
                      alt="logo"
                      height="20"
                      className="logo-light"
                    />
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="font-size-h4 mb-1">Detalles de la Interacción</h3>
                     
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-4">
                      <h5 className="font-size-18 mb-3">Información Principal</h5>
                      <div className="d-flex flex-column gap-3">
                        <div>
                          <p className="text-muted mb-1">Cliente</p>
                          <h6 className="mb-0">
                            {cliente ? (
                              <Link 
                                to={`/clientes/${cliente._id}`} 
                                className="text-primary text-decoration-none"
                              >
                                {cliente.nombre}
                              </Link>
                            ) : "No asignado"}
                          </h6>
                        </div>
                        
                        <div>
                          <p className="text-muted mb-1">Tipo de Interacción</p>
                          <span className="badge bg-primary bg-opacity-10 text-primary fs-6">
                            {interaccion?.tipo_interaccion}
                          </span>
                        </div>
                         <div>
                          <p className="text-muted mb-1">Estado</p>
                          <span className={`${getEstadoStyle(interaccion?.estado)} px-3 py-2 rounded`}>
                        {interaccion?.estado.toUpperCase()}
                      </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-4">
                      <h5 className="font-size-18 mb-3">Detalles Adicionales</h5>
                      <div className="d-flex flex-column gap-3">
                        <div>
                          <p className="text-muted mb-1">Fecha y Hora</p>
                          <h6 className="mb-0">
                            {formatDateTime(interaccion?.fecha)}
                          </h6>
                        </div>
                       <div>
                        
                    <p className="text-muted mb-1">Responsable</p>
                    <h6 className="mb-0">
                    {interaccion?.responsable && usersMap[interaccion.responsable]
                     ? `${usersMap[interaccion.responsable].name} ${usersMap[interaccion.responsable].apellidos}` : "No asignado"}
                    </h6>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="font-size-18 mb-3">Descripción</h5>
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="mb-0 fs-6">
                      {interaccion?.descripcion || 
                       <span className="text-muted">No hay descripción disponible</span>}
                    </p>
                  </div>
                </div>

                <div className="d-print-none mt-4">
                  <div className="float-end">
                    <Link
                      to="/ListaInteraccions"
                      className="btn btn-primary w-md waves-effect waves-light"
                    >
                      <i className="uil uil-arrow-left me-2"></i> Volver
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </LoadingError>
  );
};

export default DetalleInteraccion;