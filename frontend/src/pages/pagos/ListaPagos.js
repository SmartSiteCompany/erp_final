import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { Link, useNavigate } from "react-router-dom";
import useSearchFilter from "../../hooks/useSearchFilter";
import usePagination from "../../hooks/usePagination";
import BotonesAccion from "../../components/BotonesAccion";
import AlertComponent from '../../components/AlertasComponent';
import LoadingError from "../../components/LoadingError";
import PagoService from "../../services/PagoService";
import useDateRange from "../../hooks/useDateRange";

const ListaPagos = () => {
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();
    const [pagos, setPagos] = useState([]);
    const { loading, error, obtenerPagos, eliminarPago } = PagoService();

    // Hook de búsqueda y filtro
    const {
        searchTerm, filterType, filterValue,
        handleSearchChange, handleFilterTypeChange, handleFilterValueChange
    } = useSearchFilter("metodo_pago"); // Filtro inicial por método de pago

    // Protección para asegurar que pagos sea siempre un array
    const safePagos = Array.isArray(pagos) ? pagos : [];

    const filteredPagos = safePagos.filter((pago) => {
        const referencia = pago?.referencia || '';
        const clienteNombre = pago?.cliente?.nombre || '';
        const tipoPago = pago?.tipo_pago || '';
        const metodoPago = pago?.metodo_pago || '';
        const id = pago?._id || '';
        
        const matchesSearch =
            referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tipoPago.toLowerCase().includes(searchTerm.toLowerCase()) ||
            metodoPago.toLowerCase().includes(searchTerm.toLowerCase()) ||
            id.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesFilter = filterValue === "Todos" || pago[filterType] === filterValue;
        return matchesSearch && matchesFilter;
    });
    
    const filterOptions = {
        metodo_pago: ["Todos", ...new Set(safePagos.map((pago) => pago?.metodo_pago).filter(Boolean))],
        tipo_pago: ["Todos", ...new Set(safePagos.map((pago) => pago?.tipo_pago).filter(Boolean))],
        estado: ["Todos", ...new Set(safePagos.map((pago) => pago?.estado).filter(Boolean))]
    };

    // Hook para rango de fechas
    const { dateRanges, handleDateChange } = useDateRange({ 
        fecha_inicio: "", 
        fecha_fin: "" 
    });

    // Hook de paginación
    const { current: currentPagos, currentPage, totalPages, setNextPage, setPreviousPage } = usePagination(filteredPagos, 10);

    // Filtrado por fecha
    const filterByDateRange = (pagos, fechaInicio, fechaFin) => {
        if (!Array.isArray(pagos)) return [];
        
        if (!fechaInicio && !fechaFin) return pagos;
        
        const startDate = new Date(fechaInicio);
        const endDate = new Date(fechaFin || fechaInicio);
        
        return pagos.filter(pago => {
            if (!pago?.fecha_pago) return false;
            const pagoDate = new Date(pago.fecha_pago);
            return (!fechaInicio || pagoDate >= startDate) && 
                   (!fechaFin || pagoDate <= endDate);
        });
    };

    const handleDateFilter = () => {
        const filteredByDate = filterByDateRange(
            filteredPagos, 
            dateRanges.fecha_inicio, 
            dateRanges.fecha_fin
        );
        setPagos(filteredByDate);
    };

    // Obtener pagos
    useEffect(() => {
        const fetchPagos = async () => {
            try {
                const fetchedPagos = await obtenerPagos();
                setPagos(Array.isArray(fetchedPagos) ? fetchedPagos : []);
            } catch (err) {
                console.error("Error al obtener pagos:", err);
                setPagos([]);
            }
        };
        fetchPagos();
    }, [obtenerPagos]);

    // Eliminar pago
    const handleDelete = async (id) => {
        try {
            await eliminarPago(id);
            setPagos(prevPagos => Array.isArray(prevPagos) ? prevPagos.filter(pago => pago?._id !== id) : []);
            setAlert({ type: "warning", action: "delete", entity: "pago" });
            setTimeout(() => setAlert(null), 5000);
        } catch (err) {
            console.error("Error al eliminar pago:", err);
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
        const pago = safePagos.find((p) => p?._id === id);
        if (pago) {
            navigate(`/pagos/ver/${id}`);
        } else {
            console.error('Pago no encontrado');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount || 0);
    };

    return (
        <LoadingError
            loading={loading}
            error={error}
            loadingMessage="Cargando pagos..."
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
                    <h2 className="mb-3">Lista de Pagos</h2>

                    <div className="col-md">
                        <div className="row">
                            {/* Barra de búsqueda */}
                            <div className="col-md-3 mb-2">
                                <div className="input-group shadow-sm">
                                    <input
                                        type="text" 
                                        className="form-control pe-4" 
                                        placeholder="Buscar pago..."
                                        value={searchTerm} 
                                        onChange={handleSearchChange}
                                    />
                                    <button type="button" className="btn btn-purple" style={{ marginLeft: '2px' }}>
                                        <i className="uil-search"></i>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Filtro por tipo */}
                            <div className="col-md-3 mb-2 d-flex align-items-center">
                                <div className="input-group w-100 shadow-sm">
                                    <span className="me-0 p-2 text-white bg-purple rounded-1 d-flex justify-content-center align-items-center">
                                        <i className="uil-filter fs-6"></i>
                                    </span>
                                    <select 
                                        className="form-select" 
                                        value={filterType} 
                                        onChange={handleFilterTypeChange}
                                    >
                                        <option value="metodo_pago">Método de Pago</option>
                                        <option value="tipo_pago">Tipo de Pago</option>
                                        <option value="estado">Estado</option>
                                    </select>
                                    <select 
                                        className="form-select" 
                                        value={filterValue} 
                                        onChange={handleFilterValueChange}
                                    >
                                        {filterOptions[filterType]?.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Filtro por fecha */}
                            <div className="col-md-4 mb-2">
                                <div className="input-daterange input-group shadow-sm">
                                    <input
                                        type="date" 
                                        className="form-control" 
                                        placeholder="Fecha inicio"
                                        value={dateRanges.fecha_inicio} 
                                        onChange={(e) => handleDateChange("fecha_inicio", e.target.value)}
                                    />
                                    <input
                                        type="date" 
                                        className="form-control" 
                                        placeholder="Fecha fin"
                                        value={dateRanges.fecha_fin} 
                                        onChange={(e) => handleDateChange("fecha_fin", e.target.value)}
                                    />
                                    <button
                                        type="button" 
                                        className="btn btn-purple"
                                        style={{ marginLeft: "2px" }} 
                                        onClick={handleDateFilter}
                                    >
                                        <i className="mdi mdi-filter-variant"></i>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Crear pago Button */}
                            <div className="col-md-2 mb-2">
                                <div className="input-group">
                                    <Link 
                                        to="/pagos/crear" 
                                        className="input-daterange input-group btn btn-outline-success waves-effect waves-light"
                                    >
                                        <i className="mdi mdi-plus me-1"></i> Nuevo Pago
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
                                        <th>Referencia</th>
                                        <th>Fecha</th>
                                        <th>Cliente</th>
                                        <th>Monto</th>
                                        <th>Método</th>
                                        <th>Tipo</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPagos.map((pago) => (
                                        <tr key={pago?._id}>
                                            <td>{pago?.referencia || 'N/A'}</td>
                                            <td>{pago?.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString() : 'N/A'}</td>
                                            <td>{pago?.cliente?.nombre || 'N/A'}</td>
                                            <td className="text-end">{formatCurrency(pago?.monto_pago)}</td>
                                            <td>{pago?.metodo_pago || 'N/A'}</td>
                                            <td>{pago?.tipo_pago || 'N/A'}</td>
                                            <td>
                                                <span className={`badge bg-${pago?.estado === 'Completado' ? 'success' : 
                                                                pago?.estado === 'Pendiente' ? 'warning' : 
                                                                pago?.estado === 'Cancelado' ? 'danger' : 'secondary'}`}>
                                                    {pago?.estado || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <BotonesAccion
                                                    id={pago?._id}
                                                    entidad="pago"
                                                    onDelete={handleDelete}
                                                    setAlert={setAlert}
                                                    onView={() => handleView(pago?._id)}
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

export default ListaPagos;