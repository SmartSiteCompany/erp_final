import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { Link, useNavigate } from "react-router-dom";
import useSearchFilter from "../../hooks/useSearchFilter";
import usePagination from "../../hooks/usePagination";
import useDateRange from "../../hooks/useDateRange";
import BotonesAccion from "../../components/BotonesAccion";
import AlertComponent from '../../components/AlertasComponent';
import LoadingError from "../../components/LoadingError";
import ClienteService from "../../services/ClienteService";

const ListaClientes = () => {
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const { loading, error, obtenerClientes, eliminarCliente } = ClienteService();

    //Manda un hook de busqueda y filtrar
    const {
        searchTerm, filterType, filterValue,
        handleSearchChange, handleFilterTypeChange, handleFilterValueChange
    } = useSearchFilter("");

    const filteredClientes = clientes.filter((cliente) => {
        const nombre = cliente.nombre || ''; 
        const matchesSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterValue === "Todos" || cliente[filterType] === filterValue;
        return matchesSearch && matchesFilter;
    });
    const filterOptions = ["Todos", ...new Set(clientes.map((cliente) => cliente[filterType]))];

    //Manda un hook de busqueda y filtrar
    const { current: currentClientes, currentPage, totalPages, setNextPage, setPreviousPage } = usePagination(filteredClientes, 5);

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const fetchedClientes = await obtenerClientes();
                setClientes(fetchedClientes);
            } catch (err) {
                console.error("Error al obtener Clientes:", err);
            }
        };
        fetchClientes();
    }, [obtenerClientes]); 
    

    const handleDelete = async (id) => {
        try {
            await eliminarCliente(id);
            setClientes(clientes.filter(cliente => cliente._id !== id));
            setAlert({ type: "success", action: "delete", entity: "Cliente" });
            setTimeout(() => setAlert(null), 5000);
        } catch (err) {
            console.error("Error al eliminar Cliente:", err);
        }
    };

    const handleConfirmDelete = (id) => {
        handleDelete(id);
        setAlert(null);
    };

    const handleCancelDelete = () => {
        setAlert(null);
    };

      // Hook para rango de fechas
     const { dateRanges, handleDateChange } = useDateRange({ fecha: "" });

    // Filtrado por fecha
    const filterByDate = (clientes, date) => {
      if (!date) return clientes;
      const filterDate = new Date(date);
      return clientes.filter(cliente => {
          const clienteDate = new Date(clientes.fecha);
          return clienteDate.toDateString() === filterDate.toDateString();
      });
  };

  const handleDateFilter = () => {
      const filteredByDate = filterByDate(filteredClientes, dateRanges.fecha);
      setClientes(filteredByDate);
  };


//obtener vista
    const handleView = (id) => {
        const cliente = clientes.find((c) => c._id === id); // Corregido: usa _id
        if (cliente) {
            navigate(`/cliente/ver/${id}`);
        } else {
            console.error('Cliente no encontrado');
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
        <h2 className="mb-3">Lista de Clientes</h2>
        
        <div className="col-md">
      <div className="row">
        {/* Barra de búsqueda (4 columnas) */}
        <div className="col-md-4 mb-2">
         <div className="input-group shadow-sm">
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
       <div className="col-md-4 mb-2 d-flex align-items-center">
       <div className="input-group w-100 shadow-sm">
       {/* Ícono de filtro fuera del grupo, con fondo redondeado */}
        <span className="me-0 p-2 text-white bg-purple rounded-1 d-flex justify-content-center align-items-center">
         <i className="uil-filter fs-6"></i>
        </span>
        {/* Select de tipo de filtro */}
       <select className="form-select" value={filterType} onChange={handleFilterTypeChange}>
           <option value="estado_cliente">Filtrar Estado</option>
           <option value="tipo_cliente">Filtrar Tipo</option>
         </select>
          <select className="form-select" value={filterValue} onChange={handleFilterValueChange}>
            {filterOptions.map(option => (
            <option key={option} value={option}>{option}</option>
           ))}
          </select>
        </div>
        </div>
       {/* Crear Cliente Button (4 columnas) */}
       <div className="col-md-4 mb-2">
         <div className="input-group shadow-sm">
           <Link to="/clientes/CrearCliente" className="input-daterange input-group btn btn-outline-success waves-effect waves-light">
            <i className="mdi mdi-plus me-1"/> Crear Cliente
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
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Fecha de Registro</th>
                      <th>Estado Cliente</th>
                      <th>Tipo Cliente</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                  {currentClientes.map((cliente) => (                      
                    <tr key={cliente._id}>
                        <td>{cliente._id}</td>
                        <td>{cliente.nombre}</td>
                        <td>{cliente.correo}</td>
                        <td>{new Date(cliente.fecha_registro).toLocaleDateString()}</td>
                        <td>
                        <div className={`badge ${cliente.estado_cliente === "Activo" ? "bg-success-subtle text-success" : 
                          cliente.estado_cliente === "Inactivo" ? "bg-secondary-subtle text-secondary" : "bg-warning-subtle text-warning" } font-size-12`}>
                        {cliente.estado_cliente}
                      </div>

                        </td>
                        <td>{cliente.tipo_cliente}</td>
                        <td>
                          {/* Aquí usas el componente BotonesAccion */}
                        <BotonesAccion id={cliente._id} 
                        entidad="cliente"
                        onDelete={handleDelete}
                        setAlert={setAlert}
                        onView={() => handleView(cliente._id)}
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
      <br/>
</Layout>
</LoadingError>
  );
};

export default ListaClientes;
