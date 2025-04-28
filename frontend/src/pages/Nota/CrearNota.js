import React, { useState, useEffect } from 'react';
import NotaService from '../../services/NotaService';
import ClienteService from "../../services/ClienteService";
import UserService from "../../services/UserService";
import Layout from "../../layouts/pages/layout";
import { useNavigate } from "react-router-dom";
import AlertComponent from '../../components/AlertasComponent';
import SelectGroup from '../../components/SelectGroup';

const CrearNota = () => {
  const navigate = useNavigate();
  const { crearNota } = NotaService();
  const { obtenerClientes } = ClienteService();
  const { obtenerUsuarios } = UserService();

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    cliente_id: '',
    usuario_id: '',
    fecha_creacion: new Date().toISOString().split('T')[0]
  });

  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Obtener datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [clientesData, usuariosData] = await Promise.all([
          obtenerClientes(),
          obtenerUsuarios()
        ]);
        setClientes(clientesData);
        setUsuarios(usuariosData);
      } catch (err) {
        handleError("Error al cargar datos iniciales", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [obtenerClientes, obtenerUsuarios]);

  const clientesOptions = clientes.map(cliente => ({
    value: cliente._id,
    label: cliente.nombre,
    grupo: cliente.tipo_cliente
  }))

  const usuariosOptions = usuarios.map(usuario => ({
    value: usuario._id,
    label: usuario.name,
    grupo: usuario.filial_id?.nombre_filial
  }))

  const handleError = (message, error) => {
    console.error(message, error);
    setAlertType("error");
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await crearNota({
        ...formData,
        fecha_creacion: new Date().toISOString()
      });
      
      setAlertType("success");
      setAlertMessage("Nota creada exitosamente!");
      setShowAlert(true);
      
      setTimeout(() => navigate('/Nota'), 2000);
    } catch (error) {
      handleError("Error al crear la nota", error);
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
                <h3 className="font-size-h4">Crear Nueva Nota</h3>
                <div className="mb-6">
                  <img src="/assets/images/logo-dark.png" alt="logo" height="25" className="logo-dark" />
                  <img src="/assets/images/logo-light.png" alt="logo" height="25" className="logo-light" />
                </div>
              </div>
              <hr className="my-4" />

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <SelectGroup
                      name="cliente_id" label="Cliente" class=""
                      value={formData.cliente_id} onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                      options={clientesOptions} groupBy="grupo" required/>
                  </div>

                  <div className="col-md-6 mb-3">
                  <SelectGroup
                      name="usuario_id" label="Usuario" class=""
                      value={formData.usuario_id} onChange={(e) => setFormData({...formData, usuario_id: e.target.value})}
                      options={usuariosOptions} groupBy="grupo" required/>
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
                      onClick={() => navigate('/Nota')}
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
                          <span className="spinner-border spinner-border-sm me-1" 
                                role="status" 
                                aria-hidden="true"></span>
                          Guardando...
                        </>
                      ) : "Crear Nota"}
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
          action={alertType === "success" ? "create" : "error"}
          onCancel={handleAlertClose}
          message={alertMessage}
        />
      )}
    </Layout>
  );
};

export default CrearNota;