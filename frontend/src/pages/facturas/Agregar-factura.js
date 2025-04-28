import React, { useState } from 'react';
import Layout from '../../layouts/pages/layout';


const CrearFactura = () => {
  const [newFactura, setNewFactura] = useState({
    numeroFactura: "",
    fecha: "",
    nombreCliente: "",
    rfcCliente: "",
    items: [{ descripcion: "", precio: "", cantidad: 1 }],
    estado: "Pendiente",
  });

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (name.startsWith("items")) {
      const field = name.split(".")[1];
      const updatedItems = [...newFactura.items];
      updatedItems[index][field] = value;
      setNewFactura({ ...newFactura, items: updatedItems });
    } else {
      setNewFactura({ ...newFactura, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Factura a agregar:", newFactura);
    // Aquí iría la lógica para guardar la factura
  };

  const addItem = () => {
    setNewFactura({
      ...newFactura,
      items: [...newFactura.items, { descripcion: "", precio: "", cantidad: 1 }],
    });
  };

  const removeItem = (index) => {
    const updatedItems = newFactura.items.filter((_, i) => i !== index);
    setNewFactura({ ...newFactura, items: updatedItems });
  };

  return (
    <Layout>
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
            <h2 className="float-left font-size-h4">Nueva Factura</h2>
              <div className="invoice-title d-flex flex-column align-items-center">
                <img src="/assets/images/logo-dark.png" alt="logo" height="20" className="logo-dark ms-auto" />
                 <h2 className="font-size-20 text-center w-100">Factura</h2>
              </div>

              <hr className="my-4" />

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="mb-3">
                      <label htmlFor="numeroFactura" className="form-label">Número de Factura</label>
                      <input type="text" className="form-control" id="numeroFactura" name="numeroFactura" value={newFactura.numeroFactura} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="nombreCliente" className="form-label">Nombre del Cliente</label>
                      <input type="text" className="form-control" id="nombreCliente" name="nombreCliente" value={newFactura.nombreCliente} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="rfcCliente" className="form-label">RFC del Cliente</label>
                      <input type="text" className="form-control" id="rfcCliente" name="rfcCliente" value={newFactura.rfcCliente} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="mb-3">
                      <label htmlFor="fecha" className="form-label">Fecha de Factura</label>
                      <input type="date" className="form-control" id="fecha" name="fecha" value={newFactura.fecha} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="estado" className="form-label">Estado</label>
                      <select className="form-select" id="estado" name="estado" value={newFactura.estado} onChange={handleChange}>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagado">Pagado</option>
                        <option value="Cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <h5 className="font-size-15">Detalles de la Factura</h5>
                  <div className="table-responsive">
                    <table className="table table-nowrap table-centered mb-0">
                      <thead>
                        <tr>
                          <th>Descripción</th>
                          <th>Precio</th>
                          <th>Cantidad</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newFactura.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <input type="text" className="form-control" name={`items[${index}].descripcion`} value={item.descripcion} onChange={(e) => handleChange(e, index)} />
                            </td>
                            <td>
                              <input type="number" className="form-control" name={`items[${index}].precio`} value={item.precio} onChange={(e) => handleChange(e, index)} />
                            </td>
                            <td>
                              <input type="number" className="form-control" name={`items[${index}].cantidad`} value={item.cantidad} onChange={(e) => handleChange(e, index)} min="1" />
                            </td>
                            <td>
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" className="btn btn-primary mt-2" onClick={addItem}>Agregar Item</button>
                </div>

                <div className="d-print-none mt-4">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary w-md waves-effect waves-light">Guardar Factura</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CrearFactura;