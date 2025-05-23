import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import UserService from "../../services/UserService";
import FilialService from "../../services/FilialService";

const DetalleUsuario = ({ entidad }) => {
  const { id } = useParams();
  const { error: userError, obtenerUsuarioPorId } = UserService;
  const { error: filialError, obtenerFilials } = FilialService();
  
  const [user, setUser] = useState(null);
  const [filiales, setFiliales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userData, filialesData] = await Promise.all([
          obtenerUsuarioPorId(id),
          obtenerFilials()
        ]);
        
        console.log("Datos del usuario obtenidos:", userData);
        console.log("Datos de filiales obtenidos:", filialesData);
        
        if (!userData) throw new Error("Usuario no encontrado");
        
        setUser(userData);
        setFiliales(filialesData);
      } catch (err) {
        console.error("Error al obtener datos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Función para obtener el nombre de la filial
  const getNombreFilial = (filialId) => {
    if (!filialId) return "Sin filial asignada";
    const filial = filiales.find(f => f._id === filialId);
    return filial ? filial.nombre_filial : "Filial no encontrada";
  };

  return (
    <LoadingError
      loading={loading}
      error={error || userError || filialError}
      loadingMessage="Cargando datos..."
      errorMessage={error?.message}
    >
      <Layout>
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="invoice-title">
                  <h4 className="float-end font-size-16">Usuario #{user?._id}</h4>
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
                  <div className="text-muted">
                    <h3 className="font-size-h4 mb-1">Detalles del Usuario</h3>
                  </div>
                </div>

                <hr className="my-3" />

                <div className="row">
                  {/* Columna para la Foto */}
                  <div className="col-md-4">
                    <div className="text-center">
                      <img
                        src={user?.foto_user || "/assets/images/users/user-default.png"}
                        alt="Foto de perfil"
                        className="rounded-circle"
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                      />
                    </div>
                  </div>

                  {/* Columna para la Información del Usuario */}
                  <div className="col-md-8">
                    <div className="text-muted">
                      <h5 className="font-size-20 mb-3">Información Personal:</h5>
                      <p className="font-size-16 mb-2">
                        <strong>Nombre:</strong> {user?.name} {user?.apellidos}
                      </p>
                      <p className="font-size-16 mb-2">
                        <strong>Email:</strong> {user?.email}
                      </p>
                      
                      <h5 className="font-size-18 mt-4 mb-1">Detalles Laborales:</h5>
                      
                      <p className="font-size-16 mb-2">
                        <strong>Rol:</strong> {user?.rol_user || "No especificado"}
                      </p>
                      <p className="font-size-16 mb-2">
                        <strong>Filial:</strong> {user?.filial_id ? getNombreFilial(user.filial_id) : "Sin filial asignada"}
                      </p>
                      
                      <h5 className="font-size-18 mt-4 mb-1">Estado:</h5>
                      <p className="font-size-16 mb-2">
                        <strong>Cuenta:</strong> {user?.bloqueo ? "Bloqueada" : "Activa"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="d-print-none mt-4">
                  <div className="float-end">
                    <Link
                      to="/Lista_usuarios"
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

export default DetalleUsuario;