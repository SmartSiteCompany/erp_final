import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { Link, useNavigate } from "react-router-dom";
import useSearchFilter from "../../hooks/useSearchFilter";
import usePagination from "../../hooks/usePagination";
import BotonesAccion from "../../components/BotonesAccion";
import AlertComponent from '../../components/AlertasComponent';
import LoadingError from "../../components/LoadingError";
import NotaService from "../../services/NotaService";
import UserService from "../../services/UserService";

const ListaNotas = () => {
    const [alert, setAlert] = useState(null);
    const [notas, setNotas] = useState([]);
      const [users, setUsuarios] = useState([]);
    const navigate = useNavigate();

    const { loading, error, obtenerNotas, eliminarNota } = NotaService();

    // Hook de búsqueda y filtrado
    const {
        searchTerm, filterType, filterValue,
        handleSearchChange, handleFilterTypeChange, handleFilterValueChange
    } = useSearchFilter("titulo");

   // En la función de filtrado
const filteredNotas = notas.filter((nota) => {
    const searchContent = `${nota.titulo} ${nota.contenido} ${nota.cliente_id?.nombre} ${nota.usuario_id?.name} ${nota.usuario_id?.apellidos}`.toLowerCase();
    const matchesSearch = searchContent.includes(searchTerm.toLowerCase());
    const matchesFilter = filterValue === "Todos" || nota[filterType] === filterValue;
    return matchesSearch && matchesFilter;
  });
  

    // Opciones de filtro dinámicas (ajusta según tus necesidades)
    const filterOptions = {
        titulo: [], // No tiene sentido filtrar por título directamente como lista
        'cliente_id.nombre': [], // Filtrar por nombre del cliente
        // Puedes agregar más opciones de filtro si es necesario
    };

    // Obtener valores únicos para los filtros dinámicos
    useEffect(() => {
        if (notas && notas.length > 0) {
            const clientesUnicos = [...new Set(notas.map(nota => nota.cliente_id?.nombre).filter(Boolean))];
            filterOptions['cliente_id.nombre'] = clientesUnicos;
        }
    }, [notas]);

    // Hook de paginación
    const { current: currentNotas, currentPage, totalPages, setNextPage, setPreviousPage } = usePagination(filteredNotas, 5);

    useEffect(() => {
        const fetchNotas = async () => {
            try {
                const fetchedNotas = await obtenerNotas();
                setNotas(fetchedNotas);
            } catch (err) {
                console.error("Error al obtener notas:", err);
            }
        };
        fetchNotas();
    }, [obtenerNotas]);

    const handleDelete = async (id) => {
        try {
            await eliminarNota(id);
            setNotas(notas.filter(nota => nota._id !== id));
            setAlert({ type: "warning", action: "delete", entity: "nota" });
            setTimeout(() => setAlert(null), 5000);
        } catch (err) {
            console.error("Error al eliminar nota:", err);
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
        navigate(`/notas/editar/${id}`);
    };

    // Formatear fecha legible
    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <LoadingError
            loading={loading}
            error={error}
            loadingMessage="Cargando notas..."
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
                    <h2 className="mb-3">Lista de Notas</h2>

                    <div className="col-md">
                        <div className="row">
                            <div className="col-md-4 mb-2">
                                <div className="input-group shadow-sm">
                                    <input
                                        type="text"
                                        className="form-control pe-5"
                                        placeholder="Buscar por título, contenido o cliente..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                    <button type="button" className="btn btn-primary" style={{ marginLeft: '2px' }}>
                                        <i className="uil-search"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="col-md-5 mb-2 d-flex align-items-center">
                                <div className="input-group w-100 shadow-sm">
                                    <span className="me-0 p-2 text-white bg-primary rounded-1 d-flex justify-content-center align-items-center">
                                        <i className="uil-filter fs-6"></i>
                                    </span>
                                    <select className="form-select" value={filterType} onChange={handleFilterTypeChange}>
                                        <option value="titulo">Título</option>
                                        <option value="contenido">Contenido</option>
                                        <option value="cliente_id.nombre">Cliente</option>
                                        {/* Agrega más opciones de filtro si es necesario */}
                                    </select>
                                    <select className="form-select" value={filterValue} onChange={handleFilterValueChange}>
                                        <option value="Todos">Todos</option>
                                        {filterOptions[filterType]?.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 mb-2">
                                <div className="input-group">
                                    <Link to="/Nota/CrearNota" className="input-daterange input-group btn btn-outline-success waves-effect waves-light">
                                        <i className="uil-plus fs-6" /> Nueva Nota
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-12">
                        <div className="table-responsive shadow-sm">
                            <table className="table table-centered table-striped table-bordered">
                            <thead>
  <tr>
    <th>Título</th>
    <th>Contenido</th>
    <th>Cliente</th>
    <th>Usuario</th>
    <th>Fecha de Creación</th>
    <th>Acciones</th>
  </tr>
</thead>
<tbody>
  {currentNotas.map((nota) => (
    <tr key={nota._id}>
      <td>{nota.titulo}</td>
      <td className="text-truncate" style={{maxWidth: '200px'}} title={nota.contenido}>
        {nota.contenido || "No disponible"}
      </td>
      <td>{nota.cliente_id?.nombre || "Sin cliente"}</td>
      <td>{nota.usuario ? `${nota.usuario.name} ${nota.usuario.apellidos}` : "Sin usuario"}</td>
      <td>{formatFecha(nota.fecha_creacion)}</td>
      <td>
        <BotonesAccion
          id={nota._id}
          entidad="notas"
          onDelete={handleDelete}
          setAlert={setAlert}
          onView={() => handleView(nota._id)}
        />
      </td>
    </tr>
  ))}
</tbody>
                                
                            </table>
                        </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <button
                            className="btn btn-secondary shadow-sm"
                            onClick={setPreviousPage}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button
                            className="btn btn-secondary shadow-sm"
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

export default ListaNotas;