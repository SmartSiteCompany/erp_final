import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import NotaService from "../../services/NotaService";
import ClienteService from "../../services/ClienteService";
import UserService from "../../services/UserService";

const DetalleNota = () => {
  const { id } = useParams();
  const { error, obtenerNotaPorId } = NotaService();
  const { obtenerClientePorId } = ClienteService();
  const { obtenerUsuarioPorId } = UserService;
  const [nota, setNota] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const foundNota = await obtenerNotaPorId(id);
        console.log("Found Nota:", foundNota);
        
        // Verificar si se obtuvieron los IDs correctamente
        if (!foundNota || !foundNota._id) {
          setNotFound(true);
          return;
        }
  
        // Obtener IDs de relaciones
        const clienteId = foundNota.cliente_id?._id || foundNota.cliente_id;
        const usuarioId = foundNota.usuario_id?._id || foundNota.usuario_id;
        console.log("Cliente ID:", clienteId, "Usuario ID:", usuarioId);
  
        // Cargar datos relacionados en paralelo
        const [clienteData, usuarioData] = await Promise.all([
          clienteId ? obtenerClientePorId(clienteId) : Promise.resolve(null),
          usuarioId ? obtenerUsuarioPorId(usuarioId) : Promise.resolve(null)
        ]);
        console.log("Cliente Data:", clienteData, "Usuario Data:", usuarioData);
  
        setCliente(clienteData);
        setUsuario(usuarioData);
        setNota(foundNota);
  
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setNotFound(true);
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

  if (notFound) {
    return (
      <Layout>
        <div className="alert alert-danger mt-3">
          Nota no encontrada
        </div>
        <Link to="/Nota" className="btn btn-secondary mt-3">
          Volver al Listado
        </Link>
      </Layout>
    );
  }

  if (loading || !nota) {
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
              <div className="invoice-title">
                <h4 className="float-end font-size-16">ID: #{nota._id}</h4>
                <div className="text-muted">
                  <h4 className="font-size-h4 mb-1">Detalles de la Nota</h4>
                </div>
              </div>
             <hr className="my-3" />

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
                    <h6 className="text-muted mb-1">Título</h6>
                    <p className="mb-0 fw-bold">{nota.titulo}</p>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="detail-item mb-3">
                    <h6 className="text-muted mb-1">Fecha de Actualización</h6>
                    <p className="mb-0">{formatDateTime(nota.fecha_actualizacion)}
                      {formatDateTime(nota.fecha_creacion)}
                    </p>
                  </div>
                  
                  <div className="detail-item mb-3">
                    <h6 className="text-muted mb-1">Creado por</h6>
                    <p className="mb-0">
                      {usuario ? (
                        `${usuario.name} ${usuario.apellidos}`
                      ) : (
                        "Usuario no disponible"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="text-muted mb-2">Contenido</h6>
                <div className="p-3 bg-light rounded">
                  {nota.contenido || 
                   <span className="text-muted">No hay contenido disponible</span>}
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <Link
                  to="/Nota"
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

export default DetalleNota;