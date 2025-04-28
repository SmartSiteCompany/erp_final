import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom"; // Importa useParams
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import CampanaService from "../../services/CampanaService"; 

const DetalleCampana = () => {
  const { id } = useParams();
  const { obtenerCampanaPorId, loading, error } = CampanaService(); 
  const [campana, setCampana] = useState(null);

  useEffect(() => {
    const fetchCampana = async () => {
      try {
        const fetchedCampana = await obtenerCampanaPorId(id);
        console.log("Campaña por id:", fetchedCampana);
        setCampana(fetchedCampana);
      } catch (err) {
        console.error("Error al obtener campaña:", err);
      }
    };
    fetchCampana();
  }, [id]);

  return (
    <LoadingError
      loading={loading}
      error={error}
      loadingMessage="Cargando datos de la campaña..."
      errorMessage={error?.message || "Error al cargar los detalles de la campaña."}
    >
      <Layout>
        {campana && (
          <div className="row">
            <div className="col-lg-12">
               <div className="card">
                 <div className="card-body">
                  <div className="invoice-title">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="mb-2">
                      <img src="/assets/images/logo-dark.png" alt="logo" height="25" className="logo-dark" />  
                      <img src="/assets/images/logo-light.png" alt="logo" height="25" className="logo-light" />
                      </div>
                        <div>
                          <h4 className="font-size-16 mb-1">Campaña: {campana._id}</h4>
                       </div> </div>
                      </div>
                    <hr className="my-2" />
                  <div className="row">
                    <div className="col-md">
                        <div className="card-body">
                           {/* Encabezado */}
                         <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h4 className="text-primary mb-1">Detalle de la Campaña</h4>
                            <p className="font-size-17 mb-1"><strong>Titulo:</strong> {campana.nombre}</p>
                              </div>
                              <div className="text-end">
                                  <div className="text-muted font-size-15">
                                    <div>
                                      <i className="bx bx-calendar-event me-2"/>
                                      <span><strong>Inicio:</strong> {new Date(campana.fecha_inicio).toLocaleDateString()}  </span>
                                      <i className="bx bx-calendar-check me-2"/>
                                      <span><strong>Fin:</strong> {new Date(campana.fecha_fin).toLocaleDateString()}</span>
                                       </div>
                                       <span className={`badge ${campana.estado === "completada" ? "bg-success-subtle text-success" : campana.estado === "activa" ? "bg-warning-subtle text-warning" : "bg-secondary-subtle text-secondary"} font-size-12 d-inline-flex align-items-center py-2 px-4`}>
                                         {campana.estado === "completada" ? <i className="bx bx-check-circle me-1 fs-6"></i> : 
                                          campana.estado === "activa" ? <i className="bx bx-time-five me-1 fs-6"></i> : <i className="bx bx-block me-1 fs-6"></i>} 
                                         {campana.estado}
                                        </span>
                                      </div>
                                     </div>
                                    </div>
                                
                                     {/* Descripción destacada */}
                                      <div className="mt-4 pt-3">
                                        <h5 className="text-muted mb-3">Descripción de la campaña</h5>
                                         <div className="p-3 bg-light rounded">
                                            <p className="mb-0">{campana.descripcion}</p>
                                         </div>
                                       </div>
                                       <div className="d-flex align-items-center mb-1">
                                  <i className="bx bx-user me-2"></i>
                                  <span>{campana.clientes ? campana.clientes.length : 0} cliente(s) inscrito(s)</span>
                                  </div>
                                  </div>
                               </div>
                             </div>
                  <div className="p-3 ">
                    <h5 className="font-size-15">Clientes Inscritos en la Campaña</h5>

                    <div className="table-responsive">
                      <table className="table table-nowrap table-centered mb-3">
                        <thead>
                          <tr>
                            <th>No.</th>
                            <th>Nombre</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campana.clientes && campana.clientes.length > 0 ? (
                            campana.clientes.map((cliente, index) => (
                              <tr key={cliente._id}>
                                <th scope="row">{index + 1}</th>
                                <td>
                                  <h5 className="font-size-15 mb-1">{cliente.nombre}</h5>
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
                    <div className="d-print-none mt-4">
                      <div className="float-end">
                        <button onClick={() => window.print()} className="btn btn-success waves-effect waves-light me-1">
                          <i className="fa fa-print"></i> Imprimir
                        </button>
                        <button className="btn btn-primary w-md waves-effect waves-light">
                          Enviar
                        </button>
                        <Link to="/campanas" className="btn btn-secondary waves-effect waves-light ms-2">
                          Volver a Campañas
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

export default DetalleCampana;