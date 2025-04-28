import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { Link, useNavigate } from "react-router-dom";
import useSearchFilter from "../../hooks/useSearchFilter";
import usePagination from "../../hooks/usePagination";
import AlertComponent from '../../components/AlertasComponent';
import BotonesAccion from "../../components/BotonesAccion";
import LoadingError from "../../components/LoadingError";
import EstadoCuentaService from "../../services/EstadoCuentaService";

const ListaEstadoCuenta = () => {
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();
    const [EstadosCuentas, setEstadosCuenta] = useState([]);
    const { loading, error, obtenerEstadosCuenta, eliminarEstadoCuenta } = EstadoCuentaService();

    // Hook de búsqueda y filtrado
    const {
        searchTerm, filterType, filterValue,
        handleSearchChange, handleFilterTypeChange, handleFilterValueChange
    } = useSearchFilter("");

    const filteredEstadosCuenta = EstadosCuentas.filter((estadocuenta) => {
        const clienteId = estadocuenta.cliente_id?.toString() || '';
        const matchesSearch = clienteId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterValue === "Todos" || estadocuenta[filterType] === filterValue;
        return matchesSearch && matchesFilter;
    });

    const filterOptions = ["Todos", ...new Set(EstadosCuentas.map((estadocuenta) => estadocuenta[filterType]))];

    // Hook de paginación
    const { current: currentEstadosCuenta, currentPage, totalPages, setNextPage, setPreviousPage } = usePagination(filteredEstadosCuenta, 5);

    useEffect(() => {
        const fetchEstadosCuenta = async () => {
            try {
                const fetchedEstadosCuenta = await obtenerEstadosCuenta();
                setEstadosCuenta(fetchedEstadosCuenta);
            } catch (err) {
                console.error("Error al obtener Estados de Cuenta:", err);
            }
        };
        fetchEstadosCuenta();
    }, [obtenerEstadosCuenta]);

    const handleDelete = async (id) => {
        try {
            await eliminarEstadoCuenta(id);
            setEstadosCuenta(EstadosCuentas.filter(estadocuenta => estadocuenta._id !== id));
            setAlert({ type: "success", action: "delete", entity: "Estado de Cuenta" });
            setTimeout(() => setAlert(null), 5000);
        } catch (err) {
            console.error("Error al eliminar Estado de Cuenta:", err);
        }
    };

    const handleConfirmDelete = (id) => {
        handleDelete(id);
        setAlert(null);
    };

    const handleCancelDelete = () => {
        setAlert(null);
    };


        //vista
        const handleView = (id) => {
            const estadocuenta = EstadosCuentas.find((e) => e._id === id); // Corregido: usa _id
            if (estadocuenta) {
                navigate(`/estado/ver/${id}`);
            } else {
                console.error('estadocuenta no encontrado');
            }
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
                <h2 className="mb-2"><i className="fa fa-fw fa-bars" /> Lista de Estados de Cuenta</h2>

                <div className="col-md">
                    <div className="row">
                        {/* Barra de búsqueda */}
                        <div className="col-md-3 mb-2">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control pe-5"
                                    placeholder="Buscar por Cliente ID..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                <button type="button" className="btn btn-purple" style={{ marginLeft: '2px' }}>
                                    <i className="uil-search"></i>
                                </button>
                            </div>
                        </div>
                        {/* Filtro por tipo */}
                        <div className="col-md-4 mb-2 d-flex align-items-center">
                        <div className="input-group w-100 shadow-sm">
                            {/* Ícono de filtro fuera del grupo, con fondo redondeado */}
                            <span className="me-0 p-2 text-white bg-purple rounded-1 d-flex justify-content-center align-items-center">
                                <i className="uil-filter fs-6"></i>
                            </span>
                             {/* Select de tipo de filtro */}
                             <select className="form-select" value={filterType} onChange={handleFilterTypeChange}>
                                 <option value="rol">Filtrar por Rol</option>
                                 <option value="area">Filtrar por Área</option>
                             </select>
                             {/* Select dinámico de valores */}
                             <select className="form-select" value={filterValue} onChange={handleFilterValueChange}>
                                {filterOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                                ))}
                                </select>
                             </div>
                         </div>
                        {/* Crear Estado de Cuenta Button */}
                        <div className="col-md-5 mb-2">
                            <div className="input-group">
                                <Link to="/estado/CrearEstado" className="input-daterange input-group btn btn-soft-success waves-effect waves-light">
                                    <i className="mdi mdi-plus me-1"></i> Crear Estado Cuenta
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
                                    <th>ID</th>
                                    <th>Cliente ID</th>
                                    <th>Servicio ID</th>
                                    <th>Fecha Estado</th>
                                    <th>Saldo Actual</th>
                                    <th>Total a Pagar</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentEstadosCuenta.map((estadocuenta) => (
                                    <tr key={estadocuenta._id}>
                                        <td>{estadocuenta._id}</td>
                                        <td>{estadocuenta.cliente_id}</td>
                                        <td>{estadocuenta.servicio_id}</td>
                                        <td>{new Date(estadocuenta.fecha_estado).toLocaleDateString()}</td>
                                        <td>{estadocuenta.saldo_actual}</td>
                                        <td>{estadocuenta.total_a_pagar}</td>
                                        <td>
                                        <BotonesAccion
                                                id={estadocuenta._id}
                                                entidad="estadocuenta"
                                                onDelete={handleDelete}
                                                setAlert={setAlert}
                                                onView={() => handleView(estadocuenta._id)}

                                            />                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Paginación */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <button
                        className="btn btn-secondary"
                        onClick={setPreviousPage} disabled={currentPage === 1}>
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button
                        className="btn btn-secondary"
                        onClick={setNextPage} disabled={currentPage === totalPages}>
                        Siguiente
                    </button>
                </div>
            </div>
            <br />
        </Layout>
        </LoadingError>
    );
};

export default ListaEstadoCuenta;