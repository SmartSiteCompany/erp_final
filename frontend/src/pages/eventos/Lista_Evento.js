import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { Link, useNavigate } from "react-router-dom";
import useSearchFilter from "../../hooks/useSearchFilter";
import usePagination from "../../hooks/usePagination";
import BotonesAccion from "../../components/BotonesAccion";
import AlertComponent from '../../components/AlertasComponent';
import LoadingError from "../../components/LoadingError";
import EventoService from "../../services/EventoService";
import useDateRange from "../../hooks/useDateRange";

const ListaEventos = () => {
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();
    const [eventos, setEventos] = useState([]);
    const { loading, error, obtenerEventos, eliminarEvento } = EventoService();

    // Hook de búsqueda y filtro
    const {
        searchTerm, filterType, filterValue,
        handleSearchChange, handleFilterTypeChange, handleFilterValueChange
    } = useSearchFilter("ubicacion"); // Filtro inicial por ubicación

    const filteredEventos = eventos.filter((evento) => {
        const nombre = evento.nombre || '';
        const descripcion = evento.descripcion || '';
        const ubicacion = evento.ubicacion || '';
        const id = evento._id || ''; 
        const matchesSearch =
            nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterValue === "Todos" || evento[filterType] === filterValue;
        return matchesSearch && matchesFilter;
    });
    
    const filterOptions = ["Todos", ...new Set(eventos.map((evento) => evento[filterType]))];

    // Hook para rango de fechas
    const { dateRanges, handleDateChange } = useDateRange({ fecha: "" });

    // Hook de paginación
    const { current: currentEventos, currentPage, totalPages, setNextPage, setPreviousPage } = usePagination(filteredEventos, 5);

    // Filtrado por fecha
    const filterByDate = (eventos, date) => {
        if (!date) return eventos;
        const filterDate = new Date(date);
        return eventos.filter(evento => {
            const eventoDate = new Date(evento.fecha);
            return eventoDate.toDateString() === filterDate.toDateString();
        });
    };

    const handleDateFilter = () => {
        const filteredByDate = filterByDate(filteredEventos, dateRanges.fecha);
        setEventos(filteredByDate);
    };

    // Obtener eventos
    useEffect(() => {
        const fetchEventos = async () => {
            try {
                const fetchedEventos = await obtenerEventos();
                setEventos(fetchedEventos);
            } catch (err) {
                console.error("Error al obtener eventos:", err);
            }
        };
        fetchEventos();
    }, [obtenerEventos]);

    // Eliminar evento
    const handleDelete = async (id) => {
        try {
            await eliminarEvento(id);
            setEventos(eventos.filter(evento => evento._id !== id));
            setAlert({ type: "warning", action: "delete", entity: "evento" });
            setTimeout(() => setAlert(null), 5000);
        } catch (err) {
            console.error("Error al eliminar evento:", err);
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
        const evento = eventos.find((e) => e._id === id);
        if (evento) {
            navigate(`/evento/ver/${id}`);
        } else {
            console.error('Evento no encontrado');
        }
    };

    return (
        <LoadingError
            loading={loading}
            error={error}
            loadingMessage="Cargando eventos..."
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
                    <h2 className="mb-3 "> Lista de Eventos</h2>

                    <div className="col-md">
                        <div className="row">
                            {/* Barra de búsqueda */}
                            <div className="col-md-3 mb-2">
                                <div className="input-group shadow-sm">
                                    <input
                                        type="text" className="form-control pe-4" placeholder="Buscar Evento .."
                                        value={searchTerm} onChange={handleSearchChange}
                                    />
                                    <button type="button" className="btn btn-purple" style={{ marginLeft: '2px' }}>
                                        <i className="uil-search"></i>
                                    </button>
                                </div>
                            </div>
                            {/* Filtro por ubicación */}
                            <div className="col-md-3 mb-2 d-flex align-items-center">
                                <div className="input-group w-100 shadow-sm">
                                    <span className="me-0 p-2 text-white bg-purple rounded-1 d-flex justify-content-center align-items-center">
                                        <i className="uil-filter fs-6"></i>
                                    </span>
                                    <select className="form-select" value={filterType} onChange={handleFilterTypeChange}>
                                        <option value="ubicacion">Filtrar por Ubicación</option>
                                    </select>
                                    <select className="form-select" value={filterValue} onChange={handleFilterValueChange}>
                                        {filterOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Filtro por fecha */}
                            <div className="col-md-3 mb-2">
                                <div className="input-daterange input-group shadow-sm">
                                    <input
                                        type="date" className="form-control" placeholder="Fecha"
                                        value={dateRanges.fecha} onChange={(e) => handleDateChange("fecha", e.target.value)}
                                    />
                                    <button
                                        type="button" className="btn btn-purple"
                                        style={{ marginLeft: "2px" }} onClick={handleDateFilter}>
                                        <i className="mdi mdi-filter-variant"></i>
                                    </button>
                                </div>
                            </div>
                            {/* Crear evento Button */}
                            <div className="col-md-3 mb-2">
                                <div className="input-group">
                                    <Link to="/evento/CrearEvento" className="input-daterange input-group btn btn-outline-success waves-effect waves-light">
                                        <i className="mdi mdi-plus me-1"></i> Crear Evento
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
                                        <th>Fecha</th>
                                        <th>Ubicación</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentEventos.map((evento) => (
                                        <tr key={evento._id}>
                                            <td>{evento.nombre}</td>
                                            <td>{new Date(evento.fecha).toLocaleDateString()}</td>
                                            <td>{evento.ubicacion}</td>
                                            <td>
                                                <BotonesAccion
                                                    id={evento._id}
                                                    entidad="evento"
                                                    onDelete={handleDelete}
                                                    setAlert={setAlert}
                                                    onView={() => handleView(evento._id)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Paginación */}
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

export default ListaEventos;