import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import AlertComponent from "../../components/AlertasComponent";
import FilialService from "../../services/FilialService";

const CrearFilial = ({ onFilialCreado }) => {
    const navigate = useNavigate();
  const { crearFilial } = FilialService(); 
  const [formData, setFormData] = useState({ nombre_filial: "", descripcion_filial: "",});
  const [errors, setErrors] = useState({ nombre_filial:"", descripcion_filial: "", });

  // Alertas
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearFilial(formData);
      setAlertType("success");
      setAlertMessage("Filial creado exitosamente.");
      setShowAlert(true);
      setFormData({ nombre_filial: "", descripcion_filial: "",});

      if (onFilialCreado) {
        onFilialCreado(formData);
        navigate(`/Filials`);
      }
      navigate(`/Filials`);
    } catch (error) {
      console.error("Error al crear el filial", error);
      setAlertType("error");
      setAlertMessage("Error al crear el sfilial.");
      setShowAlert(true);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Limpia el error al cambiar el campo
  };


  return (
    <Layout>
      <div className="row">
        <div className="col">
          <div className="card p-4">
          <div className="invoice-title d-flex justify-content-between align-items-center">
           <h3 className="font-size-h4">Agregar Area</h3>
            <div className="mb-6">
              <img src="/assets/images/logo-dark.png" alt="logo" height="25" className="logo-dark" />  
              <img src="/assets/images/logo-light.png" alt="logo" height="25" className="logo-light" />
             </div>
           </div>
            <hr className="my-3"/>

            <form onSubmit={handleSubmit}>
                <div className="col-md-6 ">
                  <div className="mb-2 ">
                    <label className="form-label "><i className="uil-user"/> Nombre Area:</label>
                    <input type="text" name="nombre_filial" value={formData.nombre_filial} onChange={handleChange} required className="form-control shadow-sm" />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-2">
                    <label className="form-label"><i className="uil-user"/> Descripcion:</label>
                    <input type="text" name="descripcion_filial" value={formData.descripcion_filial} onChange={handleChange} required className="form-control shadow-sm" />
                  </div>
                </div>

                 <div className="text-center">
                   <button type="submit" className="btn w-lg btn-outline-success ml-3"><i className="uil-user-plus fs-6"/> Agregar Filial </button>
                 </div>
            </form>
            {showAlert && (
              <AlertComponent
                type={alertType}
                entity="Filial"
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

export default CrearFilial;