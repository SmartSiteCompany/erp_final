import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../../layouts/pages/layout";
import LoadingError from "../../components/LoadingError";
import CatalogoService from "../../services/CatalagoService";

const EditarCatalogo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    loading,
    error,
    buscarPorId,
    actualizarProducto,
    obtenerCatalogo // Agregamos esta función del servicio
  } = CatalogoService();

  const [producto, setProducto] = useState({
    codigo: "",
    nombre: "",
    codigoTienda: "",
    categoria: "",
    subcategoria: "",
    precioCompra: 0,
    precioSinFinanciamiento: 0,
    precioConFinanciamiento: 0,
    seccion: "",
    estatus: "Activo"
  });

  const [categorias, setCategorias] = useState([]); // Estado para almacenar categorías
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const estadosProducto = ["Activo", "Inactivo"];

  // Función para obtener categorías únicas desde la base de datos
  const obtenerCategorias = async () => {
    setLoadingCategorias(true);
    try {
      const productos = await obtenerCatalogo();
      // Extraer categorías únicas
      const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];
      setCategorias(categoriasUnicas);
    } catch (err) {
      console.error("Error al obtener categorías:", err);
    } finally {
      setLoadingCategorias(false);
    }
  };

  useEffect(() => {
    // Cargar categorías al montar el componente
    obtenerCategorias();

    // Cargar producto si hay código
    const cargarProducto = async () => {
      if (id) {
        try {
          const productoEncontrado = await buscarPorId(id);
          if (productoEncontrado) {
            setProducto({
              ...productoEncontrado,
              precioCompra: productoEncontrado.precioCompra || 0,
              precioSinFinanciamiento: productoEncontrado.precioSinFinanciamiento || 0,
              precioConFinanciamiento: productoEncontrado.precioConFinanciamiento || 0
            });
          }
        } catch (err) {
          console.error("Error al cargar producto:", err);
        }
      }
    };
    cargarProducto();
  }, [id]);

  // Resto del componente permanece igual...
  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name.includes("precio") ? 
      (value === "" ? 0 : parseFloat(value)) : 
      value;
    
    setProducto(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarProducto(producto.codigo, producto);
      navigate(`/Catalogo`);
    } catch (err) {
      console.error("Error al actualizar producto:", err);
    }
  };
  return (
    <LoadingError
      loading={loading}
      error={error}
      loadingMessage="Cargando datos del producto..."
      errorMessage={error?.message}
    >
      <Layout>
        <div className="row">
          <div className="col">
            <div className="card p-4">
              <div className="card-body">
                <div className="invoice-title d-flex justify-content-between align-items-center">
                  <h3 className="font-size-h4">Editar Producto</h3>
                  <div className="mb-6">
                    <img src="/assets/images/logo-dark.png" alt="logo" height="25" className="logo-dark" />  
                    <img src="/assets/images/logo-light.png" alt="logo" height="25" className="logo-light" />
                  </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                  {/* Primera fila - Códigos */}
                  <div className="row mt-3">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="codigo" className="form-label">Código Smart*</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="codigo" 
                          name="codigo" 
                          value={producto.codigo} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="codigoTienda" className="form-label">Código Tienda</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="codigoTienda" 
                          name="codigoTienda" 
                          value={producto.codigoTienda} 
                          onChange={handleChange} 
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="estatus" className="form-label">Estatus*</label>
                        <select 
                          className="form-select" 
                          id="estatus" 
                          name="estatus" 
                          value={producto.estatus} 
                          onChange={handleChange}
                          required
                        >
                          {estadosProducto.map((estado) => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Segunda fila - Nombre y categorías */}
                  <div className="row">
                    <div className="col-md-8">
                      <div className="mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre*</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="nombre" 
                          name="nombre" 
                          value={producto.nombre} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="seccion" className="form-label">Sección</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="seccion" 
                          name="seccion" 
                          value={producto.seccion} 
                          onChange={handleChange} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tercera fila - Categorías */}
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                      <label>Categoría <span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    name="categoria"
                    value={producto.categoria}
                    onChange={handleChange}
                    required
                    disabled={loadingCategorias}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {/* Opción para agregar nueva categoría si no existe */}
                    {!categorias.includes(producto.categoria) && producto.categoria && (
                      <option value={producto.categoria}>{producto.categoria} (nueva)</option>
                    )}
                  </select>
                  {loadingCategorias && (
                    <small className="text-muted">Cargando categorías...</small>
                  )}
                </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="subcategoria" className="form-label">Subcategoría</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="subcategoria" 
                          name="subcategoria" 
                          value={producto.subcategoria} 
                          onChange={handleChange} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cuarta fila - Precios */}
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="precioCompra" className="form-label">Precio Compra ($)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          id="precioCompra" 
                          name="precioCompra" 
                          value={producto.precioCompra} 
                          onChange={handleChange} 
                          step="0.01" 
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="precioSinFinanciamiento" className="form-label">Precio sin Financiamiento ($)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          id="precioSinFinanciamiento" 
                          name="precioSinFinanciamiento" 
                          value={producto.precioSinFinanciamiento} 
                          onChange={handleChange} 
                          step="0.01" 
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label htmlFor="precioConFinanciamiento" className="form-label">Precio con Financiamiento ($)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          id="precioConFinanciamiento" 
                          name="precioConFinanciamiento" 
                          value={producto.precioConFinanciamiento} 
                          onChange={handleChange} 
                          step="0.01" 
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="d-flex justify-content-end mt-4">
                    <button type="submit" className="btn btn-primary me-2">
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                    <Link to={`/Catalogo`} className="btn btn-danger">
                      Cancelar
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </LoadingError>
  );
};

export default EditarCatalogo;