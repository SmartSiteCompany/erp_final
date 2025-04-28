import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { Link, useNavigate } from "react-router-dom";
import useSearchFilter from "../../hooks/useSearchFilter";
import usePagination from "../../hooks/usePagination";
import BotonesAccion from "../../components/BotonesAccion";
import AlertComponent from '../../components/AlertasComponent';
import LoadingError from "../../components/LoadingError";
import InteraccionService from "../../services/InteraccionService";

const ListaInteraccions = () => {
    const [alert, setAlert] = useState(null);
    const [interacciones, setInteracciones] = useState([]);
    const navigate = useNavigate();

    const { loading, error, obtenerInteracciones, eliminarInteraccion } = InteraccionService();

    // Hook de búsqueda y filtrado
    const {
        searchTerm, filterType, filterValue,
        handleSearchChange, handleFilterTypeChange, handleFilterValueChange
    } = useSearchFilter("tipo_interaccion");

    const filteredInteracciones = interacciones.filter((interaccion) => {
        const searchContent = `${interaccion.tipo_interaccion} ${interaccion.descripcion} ${interaccion.responsable}`.toLowerCase();
        const matchesSearch = searchContent.includes(searchTerm.toLowerCase());
        const matchesFilter = filterValue === "Todos" || interaccion[filterType] === filterValue;
        return matchesSearch && matchesFilter;
    });

    // Opciones de filtro dinámicas
    const filterOptions = {
        tipo_interaccion: [ "llamada", "correo", "reunión", "visita"],
        estado: [ "pendiente", "completada", "cancelada"],
       
    };

    // Hook de paginación
    const { current: currentInteracciones, currentPage, totalPages, setNextPage, setPreviousPage } = usePagination(filteredInteracciones, 5);

    useEffect(() => {
        const fetchInteracciones = async () => {
            try {
                const fetchedInteracciones = await obtenerInteracciones();
                setInteracciones(fetchedInteracciones);
            } catch (err) {
                console.error("Error al obtener interacciones:", err);
            }
        };
        fetchInteracciones();
    }, [obtenerInteracciones]);

    const handleDelete = async (id) => {
        try {
            await eliminarInteraccion(id);
            setInteracciones(interacciones.filter(interaccion => interaccion._id !== id));
            setAlert({ type: "warning", action: "delete", entity: "interacción" });
            setTimeout(() => setAlert(null), 5000);
        } catch (err) {
            console.error("Error al eliminar interacción:", err);
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
        navigate(`/interaccions/editar${id}`);
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

    // Estilos para estados
    const getEstadoStyle = (estado) => {
        switch(estado) {
            case 'completada': return 'badge bg-success';
            case 'pendiente': return 'badge bg-warning text-dark';
            case 'cancelada': return 'badge bg-danger';
            default: return 'badge bg-secondary';
        }
    };

    return (
        <LoadingError
            loading={loading}
            error={error}
            loadingMessage="Cargando interacciones..."
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
                    <h2 className="mb-3">Lista de Interacciones</h2>

                    <div className="col-md">
                        <div className="row">
                            <div className="col-md-4 mb-2">
                                <div className="input-group shadow-sm">
                                    <input
                                        type="text"
                                        className="form-control pe-5"
                                        placeholder="Buscar por tipo, descripción o responsable..."
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
                                        <option value="tipo_interaccion">Tipo</option>
                                        <option value="llamada">Llamada</option>
                                        <option value="correo">Correo</option>
                                        <option value="reunion">Reunión</option>
                                        <option value="visita">visita</option>
                                    </select>
                                    <select className="form-select" value={filterValue} onChange={handleFilterValueChange}>
                                        {filterOptions[filterType].map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-3 mb-2">
                                <div className="input-group">
                                    <Link to="/interaccions/CrearInteraccions" className="input-daterange input-group btn btn-outline-success waves-effect waves-light">
                                        <i className="uil-plus fs-6" /> Nueva Interacción
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
                                        <th>Cliente</th>
                                        <th>Tipo</th>
                                        <th>Descripción</th>
                                        <th>Fecha/Hora</th>
                                        <th>Responsable</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentInteracciones.map((interaccion) => (
                                        <tr key={interaccion._id}>
                                            <td>{interaccion.cliente_id?.nombre}</td>
                                            <td>
                                                <span className="badge bg-primary">
                                                    {interaccion.tipo_interaccion}
                                                </span>
                                            </td>
                                            <td className="text-truncate" style={{maxWidth: '200px'}} title={interaccion.descripcion}>
                                                {interaccion.descripcion || "No disponible"}
                                            </td>
                                            <td>{formatFecha(interaccion.fecha)}</td>
                                            <td>{interaccion.responsable}</td>
                                            <td>
                                                <span className={getEstadoStyle(interaccion.estado)}>
                                                    {interaccion.estado}
                                                </span>
                                            </td>
                                            <td>
                                                <BotonesAccion
                                                    id={interaccion._id}
                                                    entidad="interaccions"
                                                    onDelete={handleDelete}
                                                    setAlert={setAlert}
                                                    onView={() => handleView(interaccion._id)}
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

export default ListaInteraccions;