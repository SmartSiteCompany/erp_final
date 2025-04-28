import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import EventoService from "../../services/EventoService"; 

const DetalleEvento = () => {
  const { id } = useParams();
  const { obtenerEventoPorId, loading, error } = EventoService(); 
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const fetchedEvento = await obtenerEventoPorId(id);
        console.log("Evento por id:", fetchedEvento);
        setEvento(fetchedEvento);
      } catch (err) {
        console.error("Error al obtener evento:", err);
      }
    };
    fetchEvento();
  }, [id]);

  return (
    <LoadingError
      loading={loading}
      error={error}
      loadingMessage="Cargando datos del evento..."
      errorMessage={error?.message || "Error al cargar los detalles del evento."}
    >
      <Layout>
        {evento && (
          <div className="row">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-body">
                  <div className="invoice-title">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="mb-2">
                        <img src="/assets/images/logo-dark.png" alt="logo" height="25" className="logo-dark"/>
                        <img src="/assets/images/logo-light.png" alt="logo" height="25" className="logo-light"/>
                      </div>
                      <div>
                        <h4 className="font-size-16 mb-1">Evento: {evento._id}</h4>
                      </div>
                    </div>
                  </div>
                  <hr className="my-2" />
                  <div className="row">
                    <div className="col-md">
                      <div className="card-body">
                        {/* Encabezado */}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h4 className="text-primary mb-1">Detalle del Evento</h4>
                            <p className="font-size-17 mb-1"><strong>Título:</strong> {evento.nombre}</p>
                          </div>
                          <div className="text-end">
                            <div className="text-muted font-size-15">
                              <div>
                                <i className="bx bx-calendar-event me-2"/>
                                <span><strong>Fecha:</strong> {new Date(evento.fecha).toLocaleDateString()}</span>
                              </div>
                              <div className="mt-1">
                                <i className="bx bx-map me-2"/>
                                <span><strong>Ubicación:</strong> {evento.ubicacion}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Descripción destacada */}
                        <div className="mt-4 pt-3">
                          <h5 className="text-muted mb-3">Descripción del evento</h5>
                          <div className="p-3 bg-light rounded">
                            <p className="mb-0">{evento.descripcion}</p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center mb-1">
                          <i className="bx bx-user me-2"></i>
                          <span>{evento.clientes ? evento.clientes.length : 0} cliente(s) registrado(s)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h5 className="font-size-15">Clientes Registrados en el Evento</h5>

                    <div className="table-responsive">
                      <table className="table table-nowrap table-centered mb-3">
                        <thead>
                          <tr>
                            <th>No.</th>
                            <th>Nombre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {evento.clientes && evento.clientes.length > 0 ? (
                            evento.clientes.map((cliente, index) => (
                              <tr key={cliente._id}>
                                <th scope="row">{index + 1}</th>
                                <td>
                                  <h5 className="font-size-15 mb-1">{cliente.nombre} {cliente.apellidos}</h5>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="text-center">
                                No hay clientes registrados en este evento.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="d-print-none mt-4">
                      <div className="float-end">
                        <button onClick={() => window.print()} className="btn btn-success waves-effect waves-light me-1">
                          <i className="fa fa-print"></i> Imprimir
                        </button>
                        <Link to="/Lista_Eventos" className="btn btn-secondary waves-effect waves-light ms-2">
                          Volver a Eventos
                        </Link>
                      </div>
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

export default DetalleEvento;