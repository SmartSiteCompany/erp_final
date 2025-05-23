import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import CatalogoService from "../../services/CatalagoService";

const DetalleCatalogo = () => {
  const { id } = useParams();
  const { buscarPorId, loading, error, setError } = CatalogoService();
  const [producto, setProducto] = useState(null);
  const [showFullTitle, setShowFullTitle] = useState(false);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const fetchedProducto = await buscarPorId(id);
        if (!fetchedProducto) {
          throw new Error('Producto no encontrado');
        }
        setProducto(fetchedProducto);
      } catch (err) {
        console.error("Error al obtener producto:", err);
        setError({ 
          message: "No se pudo cargar el producto",
          details: err.response?.data?.error || err.message 
        });
      }
    };
    
    if (id) {
      fetchProducto();
    }
  }, [id]);

  const truncateTitle = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength || showFullTitle) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <LoadingError
      loading={loading}
      error={error}
      loadingMessage="Cargando datos del producto..."
      errorMessage={error?.message || "Error al cargar los detalles del producto."}
    >
      <Layout>
        {producto && (
          <div className="row">
            <div className="col-lg-12">
              <div className="card product-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0 text-primary">Detalles del Producto</h2>
                    <p className="font-size-15">
                      <i className="bx bx-barcode me-1 font-size-15"/> {producto.codigo}
                    </p>
                  </div>
                  
                  <div className="row">
                    <div className="col-12">
                      {/* Sección de título con código y estatus destacados */}
                      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                        <h3 
                          className="product-title mb-0"
                          style={{
                            cursor: producto.nombre.length > 50 ? 'pointer' : 'default',
                            flex: '1 1 100%'
                          }}
                          onClick={() => producto.nombre.length > 50 && setShowFullTitle(!showFullTitle)}
                        >
                          {truncateTitle(producto.nombre)}
                          {producto.nombre.length > 50 && (
                            <small className="text-muted ms-2" style={{ fontSize: '0.8rem' }}>
                              ({showFullTitle ? 'Mostrar menos' : 'Mostrar más'})
                            </small>
                          )}
                        </h3>
                        
                        {/* Código y estatus más grandes y destacados */}
                        <div className="d-flex flex-wrap align-items-center gap-2" style={{ flex: '1 1 100%' }}>
                          <span className="badge bg-info fs-5 px-4 py-3">
                            <i className="bx bx-barcode me-1"></i> {producto.codigo}
                          </span>
                          
                          <span className={`badge fs-5 px-4 py-3 ${
                            producto.estatus === 'Activo' 
                              ? 'bg-success' 
                              : 'bg-danger'
                          }`}>
                            <i className="bx bx-check-circle me-1"></i> {producto.estatus}
                          </span>
                          
                          <span className="text-muted fs-5">
                            <i className="bx bx-category me-1"></i> 
                            {producto.categoria}
                            {producto.subcategoria && ` / ${producto.subcategoria}`}
                          </span>
                        </div>
                      </div>

                      {/* Precios en cards horizontales */}
                      <div className="row mb-4">
                        <div className="col-md-4 mb-3 mb-md-0">
                          <div className="card h-100 border-primary">
                            <div className="card-body text-center">
                              <h6 className="card-title text-muted">Precio Compra</h6>
                              <h4 className="text-primary">
                                ${producto.precioCompra?.toFixed(2) || '0.00'}
                              </h4>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 mb-3 mb-md-0">
                          <div className="card h-100 border-success">
                            <div className="card-body text-center">
                              <h6 className="card-title text-muted">Precio Público</h6>
                              <h4 className="text-success">
                                ${producto.precioSinFinanciamiento?.toFixed(2) || '0.00'}
                              </h4>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="card h-100 border-warning">
                            <div className="card-body text-center">
                              <h6 className="card-title text-muted">Precio Financiado</h6>
                              <h4 className="text-warning">
                                ${producto.precioConFinanciamiento?.toFixed(2) || '0.00'}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tabs de información */}
                      <ul className="nav nav-tabs mb-3" id="productTabs" role="tablist">
                        <li className="nav-item" role="presentation">
                          <button className="nav-link active" id="details-tab" data-bs-toggle="tab" data-bs-target="#details" type="button" role="tab">
                            <i className="bx bx-detail me-1"></i> Detalles
                          </button>
                        </li>
                        <li className="nav-item" role="presentation">
                          <button className="nav-link" id="info-tab" data-bs-toggle="tab" data-bs-target="#info" type="button" role="tab">
                            <i className="bx bx-info-circle me-1"></i> Información
                          </button>
                        </li>
                      </ul>
                      
                      <div className="tab-content p-3 border border-top-0 rounded-bottom mb-4">
                        <div className="tab-pane fade show active" id="details" role="tabpanel">
                          <div className="row">
                            <div className="col-md-6">
                              <p className="fs-5"><strong>Código Tienda:</strong> {producto.codigoTienda || 'N/A'}</p>
                              <p className="fs-5"><strong>Sección:</strong> {producto.seccion || 'N/A'}</p>
                            </div>
                            <div className="col-md-6">
                              <p className="fs-5"><strong>Fecha Creación:</strong> {new Date(producto.fechaCreacion).toLocaleDateString()}</p>
                              <p className="fs-5"><strong>Última Modificación:</strong> {new Date(producto.fechaModificacion).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="tab-pane fade" id="info" role="tabpanel">
                          <p className="text-muted fs-5">Información adicional del producto...</p>
                          <p className="text-muted fs-5"> {producto.nombre}</p>

                        </div>
                      </div>

                      {/* Botón de volver abajo a la derecha */}
                      <div className="d-flex justify-content-end">
                        <Link to="/Catalogo" className="btn btn-outline-secondary">
                          <i className="bx bx-arrow-back me-1"></i> Volver
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </LoadingError>
  );
};

export default DetalleCatalogo;