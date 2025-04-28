import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { Link, useNavigate } from "react-router-dom";
import useSearchFilter from "../../hooks/useSearchFilter";
import usePagination from "../../hooks/usePagination";
import BotonesAccion from "../../components/BotonesAccion";
import AlertComponent from '../../components/AlertasComponent';
import LoadingError from "../../components/LoadingError";
import CotizacionService from "../../services/CotizacionService";

const ListaCotizaciones = () => {
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const { loading, error, obtenerCotizaciones, eliminarCotizacion } = CotizacionService();

// Manda un hook de busqueda y filtrar
const {
  searchTerm, filterType, filterValue,
  handleSearchChange, handleFilterTypeChange, handleFilterValueChange
} = useSearchFilter("");

const filteredCotizaciones = cotizaciones.filter((cotizacion) => {
  const clienteNombre = cotizacion.cliente_id?.nombre || '';
  const filialNombre = cotizacion.filial_id?.nombre_filial || '';
  const matchesSearch =
    clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    filialNombre.toLowerCase().includes(searchTerm.toLowerCase()); // Combinar las condiciones
  const matchesFilter = filterValue === "Todos" || cotizacion[filterType] === filterValue;
  return matchesSearch && matchesFilter;
});

const filterOptions = ["Todos", ...new Set(cotizaciones.map((cotizacion) => cotizacion[filterType]))];
  //Manda un hook de busqueda y filtrar
  const { current: currentCotizaciones, currentPage, totalPages, setNextPage, setPreviousPage } = usePagination(filteredCotizaciones, 5);

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        console.log("Obteniendo cotizaciones...");
        const fetchedCotizaciones = await obtenerCotizaciones();
        console.log("Datos recibidos:", fetchedCotizaciones); // Verifica la estructura de datos
        setCotizaciones(fetchedCotizaciones);
      } catch (err) {
        console.error("Error al obtener Cotizaciones:", err);
        // Agrega más detalles del error
        console.error("Error completo:", err.response?.data || err.message);
      }
    };
    fetchCotizaciones();
  }, [obtenerCotizaciones]);

  const handleDelete = async (id) => {
    try {
      await eliminarCotizacion(id);
      setCotizaciones(cotizaciones.filter(cotizacion => cotizacion._id !== id));
      setAlert({ type: "success", action: "delete", entity: "Cotización" });
      setTimeout(() => setAlert(null), 5000);
    } catch (err) {
      console.error("Error al eliminar Cotización:", err);
    }
  };

  const handleConfirmDelete = (id) => {
    handleDelete(id);
    setAlert(null);
  };

  const handleCancelDelete = () => {
    setAlert(null);
  };

  const handleView = (id) => {
    const cotizacion = cotizaciones.find((c) => c._id === id);
    if (cotizacion) {
      navigate(`/cotizacion/ver/${id}`);
    } else {
      console.error('Cotización no encontrada');
    }
  };

   // Función para formatear la fecha a DD-MM-YYYY
   const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

// Formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

  return (
    <LoadingError
      loading={loading}
      error={error}
      loadingMessage="Cargando datos..."
      errorMessage={error?.message}
    >
    <Layout>
      {alert && (
        <AlertComponent
          type={alert.type}
          action={alert.action}
          entity={alert.entity}
          onConfirm={() => handleConfirmDelete(alert.id)}
          onCancel={handleCancelDelete}
        />
      )}
      <div className="card p-3">
        <h2 className="mb-3"> Lista de Cotizaciones</h2>

        <div className="col-md-10">
          <div className="row">
            {/* Barra de búsqueda (4 columnas) */}
            <div className="col-md-4 mb-2">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control pe-5"
                  placeholder="Buscar Cliente ..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button type="button" className="btn btn-purple" style={{ marginLeft: '2px' }}>
                  <i className="uil-search"></i>
                </button>
              </div>
            </div>
            {/* Filtro por tipo (2 columnas) */}
            <div className="col-md-4 mb-2 ">
              <div className="input-group w-100 shadow-sm">
               {/* Ícono de filtro fuera del grupo, con fondo redondeado */}
                <span className="me-0 p-2 text-white bg-purple rounded-1 d-flex justify-content-center align-items-center">
                 <i className="uil-filter fs-6"></i>
                                </span>
                                    {/* Select de tipo de filtro */}
                                    <select className="form-select" value={filterType} onChange={handleFilterTypeChange}>
                                        <option value="estado">Filtrar por ...</option>
                                    </select>
                                    {/* Select dinámico de valores */}
                                    <select className="form-select" value={filterValue} onChange={handleFilterValueChange}>
                                        {filterOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
            {/* Crear Cotización Button (4 columnas) */}
            <div className="col-md-4 mb-2">
              <div className="input-group">
                <Link to="/cotizacion/CrearCotizacion" className="input-daterange input-group btn btn-soft-success waves-effect waves-light">
                  <i className="mdi mdi-plus me-1"></i> Crear Cotización
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-12">
          <div className="table-responsive">
            <table className="table table-centered table-striped table-bordered">
              <thead>
                <tr>
                  <th>Nombre de Cotizacion</th>
                  <th>Filial</th>
                  <th>Cliente</th>
                  <th>Fecha Cotización</th>
                  <th>Forma Pago</th>
                  <th>Precio Venta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentCotizaciones.map((cotizacion) => (
                  <tr key={cotizacion._id}>
                    <td>{cotizacion.nombre_cotizacion}</td>
                    <td>{cotizacion.filial_id?.nombre_filial}</td>
                    <td>{cotizacion.cliente_id?.nombre}</td>
                    <td>{formatDate(cotizacion.fecha_cotizacion)}</td>
                    <td>{cotizacion.forma_pago}</td>
                    <td className="text-end">{formatCurrency(cotizacion.precio_venta)}</td>
                    <td>
                      <BotonesAccion
                        id={cotizacion._id}
                        entidad="cotizacion"
                        onDelete={handleDelete}
                        setAlert={setAlert}
                        onView={() => handleView(cotizacion._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginacion */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-secondary"
            onClick={setPreviousPage}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            className="btn btn-secondary"
            onClick={setNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
      <br />
    </Layout>
    </LoadingError>
  );
};

export default ListaCotizaciones;