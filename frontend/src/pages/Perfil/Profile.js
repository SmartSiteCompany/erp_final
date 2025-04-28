import React, { useEffect, useState } from 'react';
import Layout from "../../layouts/pages/layout";
import UserService from "../../services/UserService";
import TareaService from "../../services/TareaService";
import EditarPerfil from "../Perfil/EditarPerfil";

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [loadingTareas, setLoadingTareas] = useState(false);
  const [errorTareas, setErrorTareas] = useState(null);

  const userService = UserService();
  const tareaService = TareaService();

  // Obtener usuarios solo una vez al montar el componente
  useEffect(() => {
    let isMounted = true;
    
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.obtenerUsuarios();
        if (isMounted && fetchedUsers.length > 0) {
          setCurrentUser(fetchedUsers[0]);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Error al cargar los datos del usuario");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
  
    fetchUsers();
    
  
    // Función de limpieza
    return () => {
      isMounted = false;
    };
  }, []);
  // Obtener tareas cuando cambia el usuario
  useEffect(() => {
    if (!currentUser) return;
    
    let isMounted = true;
    
    const fetchTareas = async () => {
      setLoadingTareas(true);
      setErrorTareas(null);
      try {
        const fetchedTareas = await tareaService.obtenerTareas();
        if (isMounted) {
          // Filtramos las tareas que pertenecen al usuario actual
          const userTareas = fetchedTareas.filter(tarea => 
            tarea.usuario_id && tarea.usuario_id._id === currentUser._id
          );
          setTareas(userTareas);
        }
      } catch (err) {
        if (isMounted) {
          setErrorTareas(err.message || "Error al cargar las tareas");
        }
      } finally {
        if (isMounted) {
          setLoadingTareas(false);
        }
      }
    };
  
    fetchTareas();
    
    // Función de limpieza
    return () => {
      isMounted = false;
    };
  }, [currentUser?._id]);// Solo se ejecuta cuando cambia el ID del usuario

  const handleEditPhotoClick = () => {
    setIsEditingPhoto(true);
    setUploadSuccessMessage(null); // Limpiar cualquier mensaje de éxito anterior
  };

  const handleCancelEditPhoto = () => {
    setIsEditingPhoto(false);
    setUploadSuccessMessage(null); // Limpiar cualquier mensaje de éxito
  };

  const handleProfileUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    setIsEditingPhoto(false);
    setUploadSuccessMessage('¡Foto de perfil actualizada con éxito!'); // Mostrar mensaje de éxito
  };

  // Filtrar tareas por estado
  const tareasPendientes = tareas.filter(tarea => tarea.estado === 'pendiente');
  const tareasEnProgreso = tareas.filter(tarea => tarea.estado === 'en progreso');
  const tareasCompletadas = tareas.filter(tarea => tarea.estado === 'completada');

  // Formatear la fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return dateString;
    }
  };

  // Componente para mostrar la carga o error de tareas
  const TareasLoading = () => (
    <div className="text-center py-3">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando tareas...</span>
      </div>
      <p>Cargando tareas...</p>
    </div>
  );

  const TareasError = ({ error }) => (
    <div className="alert alert-danger">
      Error al cargar las tareas: {error}
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p>Cargando perfil...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-5">
          <p className="text-danger">Error al cargar el perfil: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Title */}
      <div className="page-title-box">
        <div className="row align-items-center">
          <div className="col-auto">
            <h4 className="page-title">Perfil</h4>
          </div>
        </div>
      </div>

      <div className="row mb-10">
        <div className="col-xl-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-center">
                {isEditingPhoto ? (
                  <EditarPerfil
                    currentUser={currentUser}
                    onProfileUpdated={handleProfileUpdated}
                    onCancel={handleCancelEditPhoto}
                  />
                ) : (
                  <>
                    <div>
                
                      <img
                        src={
                          currentUser?.foto_user
                            ? `${currentUser.foto_user}?${new Date().getTime()}`
                            : "/assets/images/users/avatar-4.jpg"
                        }
                        alt={`${currentUser?.name || 'Usuario'} ${currentUser?.apellidos || ''}`}
                        className="avatar-lg rounded-circle img-thumbnail"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/assets/images/users/avatar-4.jpg";
                        }}
                      />
                    </div>
                    <button
                      className="btn btn-sm btn-primary mt-2"
                      onClick={handleEditPhotoClick}
                      data-testid="edit-photo-btn"
                    >
                      Editar Foto
                    </button>
                  </>
                )}
                {uploadSuccessMessage && (
                  <p className="text-success mt-2">{uploadSuccessMessage}</p>
                )}
                <h5 className="mt-3 mb-1">{currentUser?.name || ''} {currentUser?.apellidos || ''}</h5>
                <p className="text-muted">{currentUser?.filial_id?.nombre_filial || 'Área no especificada'}</p>
              </div>

              <hr className="my-4" />

              <div className="text-muted">
                <div className="table-responsive mt-4">
                  <div>
                    <p className="mb-1">Nombre :</p>
                    <h5 className="font-size-16"> {currentUser?.name || ''} {currentUser?.apellidos || ''}</h5>
                  </div>
                  <div className="mt-4">
                    <p className="mb-1">Rol :</p>
                    <h5 className="font-size-16">{currentUser?.rol_user || 'Usuario'}</h5>
                  </div>
                  <div className="mt-4">
                    <p className="mb-1">Email :</p>
                    <h5 className="font-size-16">{currentUser?.email || ""}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-8">
          <div className="card mb-0">
            {/* Nav tabs */}
            <ul className="nav nav-tabs nav-tabs-custom nav-justified" role="tablist">
              <li className="nav-item">
                <a className="nav-link active" data-bs-toggle="tab" href="#about" role="tab">
                  <i className="uil uil-user-circle font-size-20"></i>
                  <span className="d-none d-sm-block">Pendientes</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab" href="#tasks" role="tab">
                  <i className="uil uil-clipboard-notes font-size-20"></i>
                  <span className="d-none d-sm-block">En Progreso</span>
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab" href="#messages" role="tab">
                  <i className="uil uil-envelope-alt font-size-20"></i>
                  <span className="d-none d-sm-block">Completadas</span>
                </a>
              </li>
            </ul>

            {/* Tab content */}
            <div className="tab-content p-4">
              {/* TAREAS PENDIENTES */}
              <div className="tab-pane active" id="about" role="tabpanel">
                <h5 className="font-size-16 mb-3">Tareas Pendientes</h5>
                <div className="card bg-light border-warning">
                  <div className="card-header bg-warning text-white">
                    <h5 className="mb-0">Pendientes ({tareasPendientes.length})</h5>
                  </div>
                  <div className="card-body">
                    {loadingTareas ? (
                      <TareasLoading />
                    ) : errorTareas ? (
                      <TareasError error={errorTareas} />
                    ) : tareasPendientes.length === 0 ? (
                      <p className="text-center text-muted my-3">No hay tareas pendientes</p>
                    ) : (
                      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead>
                              <tr>
                                <th>Descripción</th>
                                <th>Fecha Vencimiento</th>
                                <th>Cliente</th>
                                <th>Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tareasPendientes.map(tarea => (
                                <tr key={tarea._id}>
                                  <td>{tarea.descripcion}</td>
                                  <td>{formatDate(tarea.fecha_vencimiento)}</td>
                                  <td>{tarea.cliente_id?.nombre || "No especificado"}</td>
                                  <td>
                                    <span className="badge bg-warning">
                                      Pendiente
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TAREAS EN PROGRESO */}
              <div className="tab-pane" id="tasks" role="tabpanel">
                <h5 className="font-size-16 mb-3">Tareas En Progreso</h5>
                <div className="card bg-light border-info">
                  <div className="card-header bg-info text-white">
                    <h5 className="mb-0">En Progreso ({tareasEnProgreso.length})</h5>
                  </div>
                  <div className="card-body">
                    {loadingTareas ? (
                      <TareasLoading />
                    ) : errorTareas ? (
                      <TareasError error={errorTareas} />
                    ) : tareasEnProgreso.length === 0 ? (
                      <p className="text-center text-muted my-3">No hay tareas en progreso</p>
                    ) : (
                      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead>
                              <tr>
                                <th>Descripción</th>
                                <th>Fecha Vencimiento</th>
                                <th>Cliente</th>
                                <th>Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tareasEnProgreso.map(tarea => (
                                <tr key={tarea._id}>
                                  <td>{tarea.descripcion}</td>
                                  <td>{formatDate(tarea.fecha_vencimiento)}</td>
                                  <td>{tarea.cliente_id?.nombre || "No especificado"}</td>
                                  <td>
                                    <span className="badge bg-info">
                                      En Progreso
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* TAREAS COMPLETADAS */}
              <div className="tab-pane" id="messages" role="tabpanel">
                <h5 className="font-size-16 mb-3">Tareas Completadas</h5>
                <div className="card bg-light border-success">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">Completadas ({tareasCompletadas.length})</h5>
                  </div>
                  <div className="card-body">
                    {loadingTareas ? (
                      <TareasLoading />
                    ) : errorTareas ? (
                      <TareasError error={errorTareas} />
                    ) : tareasCompletadas.length === 0 ? (
                      <p className="text-center text-muted my-3">No hay tareas completadas</p>
                    ) : (
                      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead>
                              <tr>
                                <th>Descripción</th>
                                <th>Fecha Vencimiento</th>
                                <th>Cliente</th>
                                <th>Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tareasCompletadas.map(tarea => (
                                <tr key={tarea._id}>
                                  <td>{tarea.descripcion}</td>
                                  <td>{formatDate(tarea.fecha_vencimiento)}</td>
                                  <td>{tarea.cliente_id?.nombre || "No especificado"}</td>
                                  <td>
                                    <span className="badge bg-success">
                                      Completada
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;