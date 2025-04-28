import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import FilialService from "../../services/FilialService";

const DetalleFilial= () => {
  const { id } = useParams();
  const { obtenerFilialPorId, loading, error } = FilialService();
  const [filial, setfilial] = useState(null);

  useEffect(() => {
    const fetchfilial = async () => {
      try {
        const fetchedfilial = await obtenerFilialPorId(id);
        setfilial(fetchedfilial);
      } catch (err) {
        console.error("Error al obtener filial:", err);
      }
    };
    fetchfilial();
  }, [id]);

  

  return (
    <LoadingError
      loading={loading}
      error={error}
      loadingMessage="Cargando datos..."
      errorMessage={error?.message}
    >
      <Layout>
        <div className="row">
          <div className="col-lg">
            <div className="card">
              <div className="card-body">
                <div className="invoice-title">
                  <h4 className="float-end font-size-14"> # {filial?._id}</h4>
                  <div className="mb-4">

                  </div>
                </div>
                <div className="text-muted">
                  <h4 className="font-size-h4 mb-1">Detalle del Area</h4>
                </div>

                <hr className="my-4" />

                <div className="row">
                  <div className="col-sm-6">
                    <div className="text-muted">
                      <h5>Area: </h5>
                      <p className="font-size-16 mb-4">{filial?.nombre_filial}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <h5>Descripción: </h5>
                    <p className="font-size-16 mb-4">{filial?.descripcion_filial}</p>
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

export default DetalleFilial;