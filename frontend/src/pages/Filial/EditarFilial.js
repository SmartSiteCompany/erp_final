import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import FilialService from "../../services/FilialService"; 

const EditarFilial = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { obtenerFilialPorId, actualizarFilial } = FilialService();
  const [filial, setfilial] = useState({ nombre_filial: "", descripcion_filial: ""});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchfilial = async () => {
      setLoading(true);
      try {
        const foundfilial = await obtenerFilialPorId(id);
        if (!foundfilial) throw new Error("filial no encontrado");
        setfilial(foundfilial);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchfilial();
  }, [id]);


  const handleChange = (e) => {
    setfilial({ ...filial, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await actualizarFilial(id, filial);
      navigate("/Filials");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingError loading={loading} error={error} loadingMessage="Cargando datos..." errorMessage={error?.message}>
      <Layout>
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
              <div className="invoice-title d-flex justify-content-between align-items-center">
              <h3 className="font-size-h4">Editar Area</h3>
               <div className="mb-6">
                <img src="/assets/images/logo-dark.png" alt="logo" height="25" className="logo-dark" />  
                <img src="/assets/images/logo-light.png" alt="logo" height="25" className="logo-light" />
              </div>
                </div>
                <hr className="my-4" />

                <form onSubmit={handleSubmit}>
                  {/* Campos del filial */}

                    {/* Nombre y Descripción */}
                    <div className="col-md-8 mb-3">
                      <label className="form-label fw-bold">Area:</label>
                      <input name="nombre_filial" value={filial.nombre_filial} onChange={handleChange} className="form-control bg-light" />
                    </div>
                    <div className="col-md-8 mb-3">
                      <label className="form-label fw-bold">Descripción:</label>
                      <textarea name="descripcion_filial" value={filial.descripcion_filial} onChange={handleChange} className="form-control bg-light" />
                    </div>

                  {/* Botón de Guardar */}
                  <div className="text-end">
                     <button type="submit" className="btn btn-primary">Guardar Cambios</button>
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

export default EditarFilial;