import React, { useState } from 'react';
import Layout from "../../layouts/pages/layout";
import EditarPerfil from "../Perfil/EditarPerfil";
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, token } = useAuth();
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState(null);

  const handleEditPhotoClick = () => {
      setIsEditingPhoto(true);
      setUploadSuccessMessage(null); // Clear previous success message
  };

  const handleCancelEditPhoto = () => {
      setIsEditingPhoto(false);
      setUploadSuccessMessage(null); // Clear success message
  };

  const handleProfileUpdated = (updatedUser) => {
      // Ideally update user in context, but here we just update local state if needed
      setIsEditingPhoto(false);
      setUploadSuccessMessage('¡Foto de perfil actualizada con éxito!');
  };

  if (!user) {
      return (
          <Layout>
              <div className="text-center py-5">
                  <p>No autenticado. Por favor inicia sesión.</p>
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
                                      currentUser={user}
                                      onProfileUpdated={handleProfileUpdated}
                                      onCancel={handleCancelEditPhoto}
                                  />
                              ) : (
                                  <>
                                      <div>
                                          <img
                                              src={
                                                  user?.foto_user
                                                      ? `${user.foto_user}?${new Date().getTime()}` // Cache busting
                                                      : "/assets/images/users/avatar-4.jpg"
                                              }
                                              alt={`${user?.name || 'Usuario'} ${user?.apellidos || ''}`}
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
                              <h5 className="mt-3 mb-1">{user?.name || ''} {user?.apellidos || ''}</h5>
                              <p className="text-muted">{user?.filial_id?.nombre_filial || 'Área no especificada'}</p>
                          </div>

                          <hr className="my-4" />

                          <div className="text-muted">
                              <div className="table-responsive mt-4">
                                  <div>
                                      <p className="mb-1">Nombre :</p>
                                      <h5 className="font-size-16"> {user?.name || ''} {user?.apellidos || ''}</h5>
                                  </div>
                                  <div className="mt-4">
                                      <p className="mb-1">Rol :</p>
                                      <h5 className="font-size-16">{user?.rol_user || 'Usuario'}</h5>
                                  </div>
                                  <div className="mt-4">
                                      <p className="mb-1">Email :</p>
                                      <h5 className="font-size-16">{user?.email || ""}</h5>
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
                                  <span className="d-none d-sm-block">About</span>
                              </a>
                          </li>
                          <li className="nav-item">
                              <a className="nav-link" data-bs-toggle="tab" href="#tasks" role="tab">
                                  <i className="uil uil-clipboard-notes font-size-20"></i>
                                  <span className="d-none d-sm-block">Tasks</span>
                              </a>
                          </li>
                          <li className="nav-item">
                              <a className="nav-link" data-bs-toggle="tab" href="#messages" role="tab">
                                  <i className="uil uil-envelope-alt font-size-20"></i>
                                  <span className="d-none d-sm-block">Messages</span>
                              </a>
                          </li>
                      </ul>
                  </div>
              </div>
          </div>
      </Layout>
  );
};

export default Profile;
