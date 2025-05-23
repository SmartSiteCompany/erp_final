import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { Link, useNavigate } from "react-router-dom";
import useSearchFilter from "../../hooks/useSearchFilter";
import usePagination from "../../hooks/usePagination";
import BotonesAccion from "../../components/BotonesAccion";
import AlertComponent from '../../components/AlertasComponent';
import LoadingError from "../../components/LoadingError";
import CatalogoService from "../../services/CatalagoService";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ImportModal from "./ImportModal";

const ListaCatalogo = () => {
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();
    const [catalogo, setCatalogo] = useState([]);
    const [productos, setProductos] = useState([]);
    const {  loading, error, obtenerCatalogo, eliminarPorId, cargarCatalogo, buscarPorCodigo, obtenerPorCategoria } = CatalogoService();
    
    // Estado para el modal de importación
    const [showImportModal, setShowImportModal] = useState(false);

    // Hook de búsqueda y filtro
    const {
        searchTerm, filterType, filterValue,
        handleSearchChange, handleFilterTypeChange, handleFilterValueChange
    } = useSearchFilter("categoria");

    const filteredCatalogo = catalogo.filter((producto) => {
        const codigo = producto.codigo || '';
        const nombre = producto.nombre || '';
        const categoria = producto.categoria || '';
        const subcategoria = producto.subcategoria || '';
        const estatus = producto.estatus || '';
        
        const matchesSearch =
            codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subcategoria.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterValue === "Todos" || producto[filterType] === filterValue;
        return matchesSearch && matchesFilter;
    });
    
    const filterOptions = {
        categoria: ["Todos", ...new Set(catalogo.map((producto) => producto.categoria))],
        estatus: ["Todos", "Activo", "Inactivo"],
        seccion: ["Todos", ...new Set(catalogo.map((producto) => producto.seccion))]
    };

    // Hook de paginación
    const { current: currentCatalogo, currentPage, totalPages, setNextPage, setPreviousPage } = usePagination(filteredCatalogo, 25);

    // Obtener catálogo
    useEffect(() => {
        const fetchCatalogo = async () => {
            try {
                const fetchedCatalogo = await obtenerCatalogo();
                setCatalogo(fetchedCatalogo);
            } catch (err) {
                console.error("Error al obtener catálogo:", err);
            }
        };
        fetchCatalogo();
    }, [obtenerCatalogo]);

    //Elimina los productos
    const handleDelete = async (id) => {
        try {
            await eliminarPorId(id);
            setProductos(productos.filter(producto => producto._id !== id));
            setAlert({ type: "warning", action: "delete", entity: "producto" });
            setTimeout(() => setAlert(null), 5000);
        } catch (err) {
            console.error("Error al eliminar producto:", err);
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

    const handleView = (id) => {
        const producto = catalogo.find((p) => p._id === id);
        if (producto) {
            navigate(`/producto/ver/${id}`);
        } else {
            console.error('Producto no encontrado aqui');
        }
    };

    // Importar desde Excel con modal de progreso
    const handleImportSuccess = async () => {
        try {
            const fetchedCatalogo = await obtenerCatalogo();
            setCatalogo(fetchedCatalogo);
            // Puedes agregar una notificación de éxito aquí si lo deseas
        } catch (err) {
            console.error("Error al actualizar catálogo:", err);
        }
    };

    // Exportar a Excel
    const handleExport = () => {
        const dataToExport = filteredCatalogo.map(producto => ({
            'Código Smart': producto.codigo,
            'Descripción': producto.nombre,
            'Código Tienda': producto.codigoTienda,
            'Categoría': producto.categoria,
            'Subcategoría': producto.subcategoria,
            'Precio Compra': producto.precioCompra,
            'Precio Sin Financiamiento': producto.precioSinFinanciamiento,
            'Precio Con Financiamiento': producto.precioConFinanciamiento,
            'Sección': producto.seccion,
            'Estatus': producto.estatus,
            'Fecha Creación': producto.fechaCreacion,
            'Fecha Modificación': producto.fechaModificacion
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Catálogo");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Catalogo_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <LoadingError
            loading={loading}
            error={error}
            loadingMessage="Cargando catálogo..."
            errorMessage={error?.message}
        >
            <Layout>
                {alert && (
                    <AlertComponent
                        type={alert.type}
                        action={alert.action}
                        entity={alert.entity}
                        message={alert.message}
                        onConfirm={() => handleConfirmDelete(alert.id)}
                        onCancel={handleCancelDelete}
                    />
                )}
                
                 {/* Modal de Importación */}
                 <ImportModal 
    show={showImportModal}
    onHide={() => setShowImportModal(false)}
    onImportSuccess={handleImportSuccess}
    maxFileSize={10} // Tamaño máximo en MB
    allowedTypes={['xlsx', 'xls']} // Tipos de archivo permitidos
    endpoint="/api/catalogos/cargar-excel" // Endpoint personalizado
/>

                {/* Resto del código permanece igual */}
                <div className="card p-3">
                    <h2 className="mb-3">Lista de Catálogo</h2>

                    <div className="col-md">
                        <div className="row">
                            {/* Barra de búsqueda */}
                            <div className="col-md-3 mb-2">
                                <div className="input-group shadow-sm">
                                    <input
                                        type="text" className="form-control pe-4" placeholder="Buscar Producto..."
                                        value={searchTerm} onChange={handleSearchChange}
                                    />
                                    <button type="button" className="btn btn-purple" style={{ marginLeft: '2px' }}>
                                        <i className="uil-search"></i>
                                    </button>
                                </div>
                            </div>
                            {/* Filtro */}
                            <div className="col-md-3 mb-2 d-flex align-items-center">
                                <div className="input-group w-100 shadow-sm">
                                    <span className="me-0 p-2 text-white bg-purple rounded-1 d-flex justify-content-center align-items-center">
                                        <i className="uil-filter fs-6"></i>
                                    </span>
                                    <select className="form-select" value={filterType} onChange={handleFilterTypeChange}>
                                        <option value="categoria">Categoría</option>
                                        <option value="estatus">Estatus</option>
                                        <option value="seccion">Sección</option>
                                    </select>
                                    <select className="form-select" value={filterValue} onChange={handleFilterValueChange}>
                                        {filterOptions[filterType]?.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {/* Botones de Importar/Exportar */}
                            <div className="col-md-3 mb-2">
                                <div className="btn-group w-100">
                                    <button 
                                        className="btn btn-outline-primary"
                                        onClick={() => setShowImportModal(true)}
                                    >
                                        <i className="mdi mdi-upload me-1"></i> Importar
                                    </button>
                                    <button 
                                        className="btn btn-outline-success" 
                                        onClick={handleExport}
                                    >
                                        <i className="mdi mdi-download me-1"></i> Exportar
                                    </button>
                                </div>
                            </div>
                            {/* Crear producto Button */}
                            <div className="col-md-3 mb-2">
                                <div className="input-group">
                                    <Link to="/productos/CrearProducto" className="input-daterange input-group btn btn-outline-success waves-effect waves-light">
                                        <i className="mdi mdi-plus me-1"></i> Crear Producto
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
                                        <th>Código</th>
                                        <th>Nombre</th>
                                        <th>Categoría</th>
                                        <th>Subcategoría</th>
                                        <th>Precio Sin Fin.</th>
                                        <th>Precio Con Fin.</th>
                                        <th>Estatus</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentCatalogo.map((producto) => (
                                        <tr key={producto._id}>
                                            <td>{producto.codigo}</td>
                                            <td>{producto.nombre}</td>
                                            <td>{producto.categoria}</td>
                                            <td>{producto.subcategoria}</td>
                                            <td>${producto.precioSinFinanciamiento?.toFixed(2)}</td>
                                            <td>${producto.precioConFinanciamiento?.toFixed(2)}</td>
                                            <td>
                                                <span className={`badge ${producto.estatus === 'Activo' ? 'bg-success' : 'bg-danger'}`}>
                                                    {producto.estatus}
                                                </span>
                                            </td>
                                            <td>
                                                <BotonesAccion
                                                    id={producto._id}
                                                    entidad="producto"
                                                    onDelete={handleDelete}
                                                    setAlert={setAlert}
                                                    onView={() => handleView(producto._id)}
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

export default ListaCatalogo;