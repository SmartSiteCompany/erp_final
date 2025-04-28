import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NotaService from "../../services/NotaService";
import ClienteService from "../../services/ClienteService";
import UserService from "../../services/UserService";
import Layout from "../../layouts/pages/layout";
import AlertComponent from "../../components/AlertasComponent";

const EditarNota = () => {
  const { id } = useParams(); // ID de la nota desde la URL
  const navigate = useNavigate();

  const { obtenerNotaPorId, actualizarNota } = NotaService();
  const { obtenerClientes } = ClienteService();
  const { obtenerUsuarios } = UserService();

  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    cliente_id: "",
    usuario_id: "",
    fecha_creacion: "",
  });

  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Cargar clientes, usuarios y nota existente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [clientesData, usuariosData, notaData] = await Promise.all([
          obtenerClientes(),
          obtenerUsuarios(),
          obtenerNotaPorId(id)
        ]);

        setClientes(clientesData);
        setUsuarios(usuariosData);

        setFormData({
          ...notaData,
          cliente_id: notaData.cliente_id?._id || "",
          usuario_id: notaData.usuario_id?._id || "",
          fecha_creacion: notaData.fecha_creacion?.split("T")[0] || ""
        });

      } catch (error) {
        handleError("Error al cargar los datos", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleError = (message, error) => {
    console.error(message, error);
    setAlertType("error");
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await actualizarNota(id, formData);
      setAlertType("success");
      setAlertMessage("Nota actualizada exitosamente!");
      setShowAlert(true);
      setTimeout(() => navigate("/nota"), 2000);
    } catch (error) {
      handleError("Error al actualizar la nota", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertClose = () => setShowAlert(false);

  return (
    <Layout>
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="invoice-title d-flex justify-content-between align-items-center">
                <h3 className="font-size-h4">Editar Nota</h3>
                <div className="mb-6">
                  <img src="/assets/images/logo-dark.png" alt="logo" height="25" />
                </div>
              </div>
              <hr className="my-4" />

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="cliente_id" className="form-label">Cliente</label>
                    <select
                      id="cliente_id"
                      className="form-select"
                      name="cliente_id"
                      value={formData.cliente_id}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    >
                      <option value="">Seleccione un cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente._id} value={cliente._id}>
                          {cliente.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="usuario_id" className="form-label">Usuario</label>
                    <select
                      id="usuario_id"
                      className="form-select"
                      name="usuario_id"
                      value={formData.usuario_id}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    >
                      <option value="">Seleccione un usuario</option>
                      {usuarios.map((usuario) => (
                        <option key={usuario._id} value={usuario._id}>
                          {usuario.name} {usuario.apellidos}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12 mb-3">
                    <label htmlFor="titulo" className="form-label">Título</label>
                    <input
                      type="text"
                      className="form-control"
                      id="titulo"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="contenido" className="form-label">Contenido</label>
                  <textarea
                    className="form-control"
                    id="contenido"
                    name="contenido"
                    rows="6"
                    value={formData.contenido}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="d-print-none mt-4">
                  <div className="float-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => navigate("/Nota")}
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary w-md waves-effect waves-light"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Guardando...
                        </>
                      ) : (
                        "Guardar Cambios"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showAlert && (
        <AlertComponent
          type={alertType}
          entity="Nota"
          action={alertType === "success" ? "update" : "error"}
          onCancel={handleAlertClose}
          message={alertMessage}
        />
      )}
    </Layout>
  );
};

export default EditarNota;
