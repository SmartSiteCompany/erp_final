import React, { useState } from "react";
import Layout from "../../layouts/pages/layout";

const EstadosFacturas = () => {
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
        <div className="col-md-4">
          <button type="button" className="btn btn-success waves-effect waves-light">
            <i className="mdi mdi-plus me-1"></i> Agregar Factura
          </button>
        </div>
        <div className="col-md-8">
          <div className="row">
            <div className="col-md-4 position-relative">
              <input
                type="text"
                className="form-control pe-5"
                placeholder="Buscar factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i
                className="fas fa-search position-absolute top-50 translate-middle-y end-0 me-3"
                style={{ pointerEvents: "none" }}
              />
            </div>
            <div className="col-md-4">
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
                          <button className="btn btn-sm btn-primary me-1" title="Editar">
                            <i className="uil uil-pen"></i>
                          </button>
                          <button className="btn btn-sm btn-danger" title="Eliminar">
                            <i className="uil uil-trash-alt"></i>
                          </button>
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

export default EstadosFacturas;