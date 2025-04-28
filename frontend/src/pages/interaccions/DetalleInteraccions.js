import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import InteraccionService from "../../services/InteraccionService";
import ClienteService from "../../services/ClienteService";

const DetalleInteraccion = () => {
  const { id } = useParams();
  const { error, obtenerInteraccionPorId } = InteraccionService();
  const { obtenerClientePorId } = ClienteService();
  const [interaccion, setInteraccion] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

        if (foundInteraccion.cliente_id) {
          const clienteData = await obtenerClientePorId(foundInteraccion.cliente_id);
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

  if (loading || !interaccion) {
    return (
      <LoadingError
        loading={true}
        loadingMessage="Cargando datos..."
      />
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
          <div className="col">
            <div className="card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="mb-1">Detalles de la Interacción</h4>
                  <small className="text-muted">ID: #{interaccion._id}</small>
                </div>
                <span className={`${getEstadoStyle(interaccion.estado)} px-3 py-2 rounded`}>
                  {interaccion.estado.toUpperCase()}
                </span>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="detail-item mb-3">
                    <h6 className="text-muted mb-1">Cliente</h6>
                    <p className="mb-0">
                      {cliente ? (
                        <Link to={`/clientes/${cliente._id}`} className="text-primary">
                          {cliente.nombre}
                        </Link>
                      ) : (
                        <span className="text-muted">No asignado</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="detail-item mb-3">
                    <h6 className="text-muted mb-1">Tipo de Interacción</h6>
                    <span className="badge bg-primary bg-opacity-10 text-primary">
                      {interaccion.tipo_interaccion}
                    </span>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="detail-item mb-3">
                    <h6 className="text-muted mb-1">Fecha y Hora</h6>
                    <p className="mb-0">{formatDateTime(interaccion.fecha)}</p>
                  </div>
                  
                  <div className="detail-item mb-3">
                    <h6 className="text-muted mb-1">Responsable</h6>
                    <p className="mb-0">{interaccion.responsable}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-2">Descripción</h6>
                <div className="p-3 bg-light rounded">
                  {interaccion.descripcion || 
                   <span className="text-muted">No hay descripción disponible</span>}
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <Link
                  to="/ListaInteraccions"
                  className="btn btn-outline-secondary me-2"
                >
                  <i className="fas fa-arrow-left me-2"></i>Volver
                </Link>
                
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </LoadingError>
  );
};

export default DetalleInteraccion;