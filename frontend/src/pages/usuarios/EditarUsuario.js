import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import UserService from "../../services/UserService";
import FilialService from "../../services/FilialService";

const EditarUsuario = ({ entidad }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { obtenerUsuarioPorId, actualizarUsuario } = UserService;
  const { obtenerFilials } = FilialService();
  
  const [user, setUser] = useState({
    name: "", 
    apellidos: "", 
    email: "", 
    area: "", 
    rol_user: "", 
    bloqueo: "", 
    foto_user: "",
    filial_id: ""
  });
  
  const [filiales, setFiliales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtiene los datos del usuario y las filiales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [foundUser, filialesData] = await Promise.all([
          obtenerUsuarioPorId(id),
          obtenerFilials()
        ]);
        
        if (!foundUser) throw new Error("Usuario no encontrado");
        
        setUser({
          ...foundUser,
          filial_id: foundUser.filial_id?._id || foundUser.filial_id || ""
        });
        
        setFiliales(filialesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Preparar datos para enviar
      const datosActualizados = {
        ...user,
        filial_id: user.filial_id || null
      };
      
      await actualizarUsuario(id, datosActualizados);
      navigate(`/Lista_usuarios`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
                <h4 className="font-size-h4">Editar Usuario</h4>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Columna para la foto */}
                    <div className="col-md-4">
                      {user.foto_user && (
                        <div className="mb-3">
                          <label className="form-label">Foto Actual</label>
                          <br />
                          <img
                            src={user.foto_user}
                            alt="Foto de usuario"
                            style={{ maxWidth: "150px", maxHeight: "150px" }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Columna para la información del usuario */}
                    <div className="col-md-8 p-5">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="name" className="form-label">
                            Nombre
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={user.name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="apellidos" className="form-label">
                            Apellidos
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="apellidos"
                            name="apellidos"
                            value={user.apellidos}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={user.email}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="rol_user" className="form-label">
                            Rol
                          </label>
                          <select
                            className="form-control"
                            id="rol_user"
                            name="rol_user"
                            value={user.rol_user}
                            onChange={handleChange}
                          >
                            <option value="">Seleccione un rol</option>
                            <option value="Administrador">Admin</option>
                            <option value="Usuario">Usuario</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="filial_id" className="form-label">
                            Filial
                          </label>
                          <select
                            className="form-control"
                            id="filial_id"
                            name="filial_id"
                            value={user.filial_id}
                            onChange={handleChange}
                          >
                            <option value="">Seleccione una filial</option>
                            {filiales.map(filial => (
                              <option key={filial._id} value={filial._id}>
                                {filial.nombre_filial}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="bloqueo" className="form-label">
                            Estado
                          </label>
                          <select
                            className="form-control"
                            id="bloqueo"
                            name="bloqueo"
                            value={user.bloqueo}
                            onChange={handleChange}
                          >
                            <option value="false">Activo</option>
                            <option value="true">Bloqueado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-success me-2">
                      Guardar Cambios
                    </button>
                    <Link to={`/Lista_usuarios`} className="btn btn-danger">
                      Cancelar
                    </Link>
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

export default EditarUsuario;