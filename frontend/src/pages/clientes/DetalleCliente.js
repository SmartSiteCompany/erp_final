import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import ClienteService from "../../services/ClienteService";

const DetalleCliente = ({ entidad }) => {
  const { id } = useParams(); 
  const {error, obtenerClientePorId } = ClienteService(); // Nombre corregido
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("ID actual:", id);
    const fetchCliente = async () => {
      setLoading(true);
      try {
        const foundCliente = await obtenerClientePorId(id);
        console.log("Datos del Cliente obtenidos:", foundCliente);
        if (!foundCliente) throw new Error("Cliente no encontrado");
        setCliente(foundCliente);
      } catch (error) {
        console.error("Error al obtener el Cliente:", error);
        setCliente(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCliente();
  }, [id]);  

     // Función para formatear la fecha a DD-MM-YYYY
     const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
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
        <div className="col">
          <div className="card p-4">
              <div className="invoice-title">
                <h4 className="float-end font-size-16">Cliente   #{cliente?._id}</h4>
                <div className="text-muted">
                  <h4 className="font-size-h4 mb-1">Detalles del Cliente</h4>
                </div>
              </div>
              <hr className="my-3"/>


              <div className="row">
                {/* Columna para la Información del Cliente */}
                <div className="col-md-8">
                  <div className="text-muted">
                    <h5 className="font-size-20 mb-3">Información Personal:</h5>
                    <p className="font-size-16 mb-2">Nombre: {cliente?.nombre}</p>
                    <p className="font-size-16 mb-2">Dirreción: {cliente?.direccion}</p>
                    <p className="font-size-16 mb-2">Telefono: {cliente?.telefono}</p>
                    <p className="font-size-16 mb-2">Email: {cliente?.correo}</p>
                    <h5 className="font-size-18 mt-4 mb-1">Detalles:</h5>
                    <p className="font-size-16 mb-2">Estado Cliente: {cliente?.estado_cliente}</p>
                    <p className="font-size-16 mb-2">Tipo Cliente: {cliente?.tipo_cliente}</p>
                    <h5 className="font-size-18 mt-4 mb-1">Otros Datos:</h5>
                    <p className="font-size-16 mb-2">Fecha Registro: {formatDate(cliente?.fecha_registro)}</p>
                  </div>
                </div>
              </div>

              <div className="d-print-none mt-4">
                <div className="float-end">
                  <Link
                    to="/cliente/editar/:id"
                    className="btn btn-primary w-md waves-effect waves-light"
                  >
                    Editar Perfil
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

    </Layout>
    </LoadingError>
  );
};

export default DetalleCliente;