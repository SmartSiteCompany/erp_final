import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import BotonesAccion from "../../components/BotonesAccion";



const ListaFacturas = () => {

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Datos de ejemplo de facturas (reemplaza con tu lógica de obtención de datos)
  const facturas = [
    { id: "#MN0131", fecha: "2020-07-10", nombre: "Connie Franco", monto: "$141", estado: "Pagado" },
    { id: "#MN0130", fecha: "2020-07-09", nombre: "Paul Reynolds", monto: "$153", estado: "Pagado" },
    { id: "#MN0129", fecha: "2020-07-09", nombre: "Ronald Patterson", monto: "$220", estado: "Pendiente" },
    { id: "#MN0128", fecha: "2020-07-08", nombre: "Adella Perez", monto: "$175", estado: "Pagado" },
    { id: "#MN0120", fecha: "2020-07-02", nombre: "Matthew Lawler", monto: "$170", estado: "Pendiente" },
    // ... más facturas ...
  ];

  const filteredFacturas = facturas.filter(
    (factura) =>
      factura.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factura.id.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(factura => {
      if (!startDate && !endDate) return true;
      const facturaDate = new Date(factura.fecha);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if(start && end){
          return facturaDate >= start && facturaDate <= end;
      } else if (start){
          return facturaDate >= start;
      } else if (end){
          return facturaDate <= end;
      }
      return true;
  });

  return (
    <Layout>
      <div className="row mb-3">
      {/* Columna para el botón Agregar Factura */}
      <div className="col-md-3">
      <Link to="/facturas/Agregar-factura" className="input-daterange input-group btn btn-soft-success waves-effect waves-light">
        <i className="mdi mdi-plus me-1"></i> Agregar Factura
      </Link>
        
      </div>

      {/* Columna para los inputs de búsqueda y fechas */}
      <div className="col-md-8">
        <div className="row">
          {/* Columna para el input de búsqueda */}
          <div className="col-md-5 mb-2">
            <div className="input-daterange input-group">
              <input
                type="text"
                className="form-control pe-5"
                placeholder="Buscar factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Botón de filtro */}
              <button type="button" className="btn btn-primary" style={{ marginLeft: '2px' }}>
                <i className="uil-search "></i>
              </button>
            </div>
          </div>

          {/* Columna para los inputs de fechas */}
          <div className="col-md-7 mb-2">
            <div className="input-daterange input-group">
              {/* Input de Fecha de inicio */}
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
               />
              {/* Input de Fecha de fin */}
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
               />
              {/* Botón de filtro */}
              <button type="button" className="btn btn-primary" style={{ marginLeft: '2px' }}>
                <i className="mdi mdi-filter-variant"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-centered table-hover">
                  <thead>
                    <tr>
                      <th>ID de Factura</th>
                      <th>Fecha</th>
                      <th>Nombre de Facturación</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Descargar PDF</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFacturas.map((factura) => (
                      <tr key={factura.id}>
                        <td>{factura.id}</td>
                        <td>{factura.fecha}</td>
                        <td>{factura.nombre}</td>
                        <td>{factura.monto}</td>
                        <td>
                          <div className={`badge ${factura.estado === "Pagado" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"} font-size-12`}>
                            {factura.estado}
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-light btn-sm w-xs">
                            Pdf <i className="uil uil-download-alt ms-2"></i>
                          </button>
                        </td>
                        <td>
                        <BotonesAccion id={facturas.id} entidad="facturas"/> {/* Aquí usas el componente BotonesAccion */}

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Implementar paginación aquí si es necesario */}
              </div>
            </div>
          </div>
        </div>
      </div>
 </Layout>
  );
};

export default ListaFacturas;