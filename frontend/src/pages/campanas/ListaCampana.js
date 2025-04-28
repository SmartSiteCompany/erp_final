import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { Link, useNavigate } from "react-router-dom";
import useSearchFilter from "../../hooks/useSearchFilter";
import usePagination from "../../hooks/usePagination";
import BotonesAccion from "../../components/BotonesAccion";
import AlertComponent from '../../components/AlertasComponent';
import LoadingError from "../../components/LoadingError";
import CampanaService from "../../services/CampanaService"
import useDateRange from "../../hooks/useDateRange";

const ListaCampana = () => {
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();
    const [campanas, setCampanas] = useState([]);
    const { loading, error, obtenerCampanas, eliminarCampana } = CampanaService(); // Ajusta los nombres según tu servicio

    //Manda un hook de busqueda y filtrar
    const {
        searchTerm, filterType, filterValue,
        handleSearchChange, handleFilterTypeChange, handleFilterValueChange
    } = useSearchFilter("estado"); // Puedes cambiar "estado" por otro campo inicial para filtrar

    const filteredCampanas = campanas.filter((campana) => {
        const nombre = campana.nombre || '';
        const descripcion = campana.descripcion || '';
        const id = campana._id || ''; 
        const matchesSearch =
            nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterValue === "Todos" || campana[filterType] === filterValue;
        return matchesSearch && matchesFilter;
    });
    const filterOptions = ["Todos", ...new Set(campanas.map((campana) => campana[filterType]))];

    // Usar el hook para las fechas
    const { dateRanges, handleDateChange } = useDateRange({ fecha_inicio: "",  fecha_fin: "", });

    // --- Usa el hook de paginación.
    const { current: currentCampanas, currentPage, totalPages, setNextPage, setPreviousPage } = usePagination(filteredCampanas, 5);

    // Filtrado por fechas
    const filterByDateRange = (campanas, startDate, endDate) => {
        if (!startDate || !endDate) return campanas; // Si no hay fechas, retorna todas las campañas
        return campanas.filter(campana => {
            const campanaStartDate = new Date(campana.fecha_inicio);
            const campanaEndDate = new Date(campana.fecha_fin);
            return campanaStartDate >= new Date(startDate) && campanaEndDate <= new Date(endDate);
        });
    };

    // Aplicar filtro de fechas al hacer clic en el botón
    const handleDateFilter = () => {
        const filteredByDate = filterByDateRange(filteredCampanas, dateRanges.fecha_inicio, dateRanges.fecha_fin);
        setCampanas(filteredByDate); // Actualizar el estado de las campañas con el filtrado de fechas
    };

    //Obtiene las campañas
    useEffect(() => {
        const fetchCampanas = async () => {
            try {
                const fetchedCampanas = await obtenerCampanas();
                setCampanas(fetchedCampanas);
            } catch (err) {
                console.error("Error al obtener campañas:", err);
            }
        };
        fetchCampanas();
    }, [obtenerCampanas]);

    // Elimina la campaña
    const handleDelete = async (id) => {
        try {
            await eliminarCampana(id);
            setCampanas(campanas.filter(campana => campana._id !== id));
            setAlert({ type: "warning", action: "delete", entity: "campaña" });
            setTimeout(() => setAlert(null), 5000);
        } catch (err) {
            console.error("Error al eliminar campaña:", err);
        }
    };

    //confirma la eliminacion
    const handleConfirmDelete = (id) => {
        handleDelete(id);
        setAlert(null);
    };

    //Manda una alerta
    const handleCancelDelete = () => {
        setAlert(null);
    };

    //Manda a la vista de detalle (si la tienes)
    const handleView = (id) => {
        const campana = campanas.find((c) => c._id === id);
        if (campana) {
            navigate(`/campana/ver/${id}`); // Ajusta la ruta según tu configuración
        } else {
            console.error('Campaña no encontrada');
        }
    };

    return (
        <LoadingError
            loading={loading || loading}
            error={error || error}
            loadingMessage="Cargando campañas..."
            errorMessage={error?.message}
        >
            <Layout>
                {/*Manda la alerta como un modal*/}
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
                    <h2 className="mb-3 "> Lista de Campañas</h2>

                    <div className="col-lg">
                        <div className="row">
                            {/* Barra de búsqueda (4 columnas) */}
                            <div className="col-md-3 mb-2">
                                <div className="input-group shadow-sm">
                                    <input
                                        type="text" className="form-control pe-4" placeholder="Buscar Campaña .."
                                        value={searchTerm} onChange={handleSearchChange}
                                    />
                                    <button type="button" className="btn btn-purple" style={{ marginLeft: '2px' }}>
                                        <i className="uil-search"></i>
                                    </button>
                                </div>
                            </div>
                            {/* Filtro por estado (4 columnas) */}
                            <div className="col-md-3 mb-2 ">
                                <div className="input-group w-100 shadow-sm">
                                    {/* Ícono de filtro fuera del grupo, con fondo redondeado */}
                                    <span className="me-0 p-2 text-white bg-purple rounded-1 d-flex justify-content-center align-items-center">
                                        <i className="uil-filter fs-6"></i>
                                    </span>
                                    {/* Select de tipo de filtro */}
                                    <select className="form-select" value={filterType} onChange={handleFilterTypeChange}>
                                        <option value="estado">Filtrar por Estado</option>
                                    </select>
                                    {/* Select dinámico de valores */}
                                    <select className="form-select" value={filterValue} onChange={handleFilterValueChange}>
                                        {filterOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Filtro por fechas (6 columnas) */}
                            <div className="col-md-3 mb-2">
                                <div className="input-daterange input-group shadow-sm">
                                    <input
                                        type="date" className="form-control" placeholder="Fecha Inicio"
                                        value={dateRanges.fecha_inicio} onChange={(e) => handleDateChange("fecha_inicio", e.target.value)}
                                    />
                                    <input
                                        type="date" className="form-control" placeholder="Fecha Fin"
                                        value={dateRanges.fecha_fin} onChange={(e) => handleDateChange("fecha_fin", e.target.value)}    
                                    />
                                    <button
                                        type="button" className="btn btn-purple"
                                        style={{ marginLeft: "2px" }} onClick={handleDateFilter}>
                                        <i className="mdi mdi-filter-variant"></i>
                                    </button>
                                </div>
                            </div>
                            {/* Crear campaña Button (4 columnas) */}
                            <div className="col-md-3 mb-2">
                                <div className="input-group">
                                    <Link to="/Campana/CrearCampana" className="input-daterange input-group btn btn-outline-success waves-effect waves-light">
                                        <i className="mdi mdi-plus me-1"></i> Crear Campaña
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
                                        <th>Nombre</th>
                                        <th>Fecha Inicio</th>
                                        <th>Fecha Fin</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentCampanas.map((campana) => (
                                        <tr key={campana._id}>
                                            <td>{campana.nombre}</td>
                                            <td>{new Date(campana.fecha_inicio).toLocaleDateString()}</td>
                                            <td>{new Date(campana.fecha_fin).toLocaleDateString()}</td>
                                            <td>
                                                <div className={`badge ${campana.estado === "completada" ? "bg-success-subtle text-success" : campana.estado === "activa" ? "bg-warning-subtle text-warning" : "bg-secondary-subtle text-secondary"} font-size-12`}>
                                                    {campana.estado}
                                                </div>
                                            </td>
                                            <td>
                                                <BotonesAccion
                                                    id={campana._id}
                                                    entidad="campana"
                                                    onDelete={handleDelete}
                                                    setAlert={setAlert}
                                                    onView={() => handleView(campana._id)}
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

export default ListaCampana;