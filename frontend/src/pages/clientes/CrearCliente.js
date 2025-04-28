import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import AlertComponent from "../../components/AlertasComponent";
import ClienteService from "../../services/ClienteService"; // Importa tu servicio

const CrearCliente = ({ onClienteCreado }) => {
  const navigate = useNavigate();
  const { crearCliente } = ClienteService(); // Asume que tienes un método crearCliente en tu servicio
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    direccion: "",
    tipo_cliente: ["Individual", "Empresa"], // Valor por defecto
  });
  const [errors, setErrors] = useState({
    nombre: "",
    telefono: "",
    correo: "",
    direccion: "",
    tipo_cliente: "",
  });

  // Alertas
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Tipos de cliente
  const tiposCliente = ["Individual", "Empresa"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Limpia el error al cambiar el campo
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formErrors = {};
    let hasErrors = false;

    if (!formData.nombre) {
      formErrors.nombre = "El nombre es requerido.";
      hasErrors = true;
    }
    if (!formData.telefono) {
      formErrors.telefono = "El teléfono es requerido.";
      hasErrors = true;
    }
    if (!formData.correo) {
      formErrors.correo = "El correo es requerido.";
      hasErrors = true;
    }
    if (!formData.direccion) {
      formErrors.direccion = "La dirección es requerida.";
      hasErrors = true;
    }
    if (!formData.tipo_cliente) {
      formErrors.tipo_cliente = "El tipo de cliente es requerido.";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(formErrors);
      return;
    }

    try {
      await crearCliente(formData); // Llama a tu servicio para crear el cliente
      setAlertType("success");
      setAlertMessage("Cliente creado exitosamente.");
      setShowAlert(true);
      setFormData({ nombre: "", telefono: "", correo: "", direccion: "", tipo_cliente: "Individual" });
      setErrors({ nombre: "", telefono: "", correo: "", direccion: "", tipo_cliente: "" });
      if (onClienteCreado) {
        onClienteCreado(formData);
        navigate(`/Lista_Clientes`);

      }
      navigate(`/Lista_Clientes`);

    } catch (error) {
      console.error("Error al crear el cliente:", error);
      setAlertType("error");
      setAlertMessage("Error al crear el cliente.");
      setShowAlert(true);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  return (
    <Layout>
      <div className="row">
        <div className="col">
          <div className="card p-4">
          <div className="invoice-title d-flex justify-content-between align-items-center">
            <h3 className="font-size-h4">Crear Cliente</h3>
            <div className="mb-6">
              <img src="/assets/images/logo-dark.png" alt="logo" height="25" className="logo-dark" />  
              <img src="/assets/images/logo-light.png" alt="logo" height="25" className="logo-light" />
             </div>
            </div>
            <hr className="my-3"/>

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-2">
                    <label className="form-label">Nombre:</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="form-control shadow-sm" />
                    {errors.nombre && <div className="text-danger">{errors.nombre}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-2">
                    <label className="form-label">Teléfono:</label>
                    <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="form-control shadow-sm" />
                    {errors.telefono && <div className="text-danger">{errors.telefono}</div>}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-2">
                    <label className="form-label">Correo:</label>
                    <input type="email" name="correo" value={formData.correo} onChange={handleChange} className="form-control shadow-sm" />
                    {errors.correo && <div className="text-danger">{errors.correo}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-2">
                    <label className="form-label">Dirección:</label>
                    <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="form-control shadow-sm" />
                    {errors.direccion && <div className="text-danger">{errors.direccion}</div>}
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-2">
                <label className="col col-form-label">Tipo de Cliente</label>
                  <select className="form-select shadow-sm" name="tipo_cliente" value={formData.tipo_cliente} onChange={handleChange}>
                    <option value="">Selecciona un tipo</option>
                    {tiposCliente.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                  {errors.tipo_cliente && <div className="text-danger">{errors.tipo_cliente}</div>}
                </div>
              </div>
              <div className="text-center">
                <button type="submit" className="btn w-lg btn-outline-success ml-3"><i className="uil-user-plus fs-6"/> Agregar Cliente </button>
              </div>
              </form>
            {showAlert && (
              <AlertComponent
                type={alertType}
                entity="Cliente"
                action={alertType === "success" ? "create" : "error"}
                onCancel={handleAlertClose}
                message={alertMessage}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CrearCliente;