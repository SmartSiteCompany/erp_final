import React, { useState, useEffect } from "react";
import Layout from "../../layouts/pages/layout";
import { useNavigate } from "react-router-dom";
import AlertComponent from "../../components/AlertasComponent";
import CotizacionService from "../../services/CotizacionService";
import ClienteService from "../../services/ClienteService";
import FilialService from "../../services/FilialService";
import UserService from "../../services/UserService";
import CatalogoService from "../../services/CatalagoService"
import SelectGroup from "../../components/SelectGroup";

const CrearCotizacion = ({ onCotizacionCreada }) => {
  const navigate = useNavigate();
  const { crearCotizacion } = CotizacionService();
  const { obtenerClientes } = ClienteService();
  const { obtenerFilials } = FilialService();
  const { obtenerUsuarios } = UserService();
  const { obtenerProductosServicios } = CatalogoService();
  
  // Constantes del sistema
  const estadosCotizacion = ["Borrador", "Enviada", "Aprobada", "Completada", "Cancelada"];  
  const estadosServicio = ["Pendiente", "En Proceso", "Completado", "Cancelado"];
  const formasPago = ["Contado", "Financiado"];
  const metodosPago = ["Efectivo", "Transferencia", "Tarjeta Débito", "Tarjeta Crédito", "Cheque", "Depósito"];
  const tiposItem = ["Producto", "Servicio", "ManoObra"];
  
  // Configuración financiera
  const configFinanciera = {
    TARIFA_MANO_OBRA: 100,
    IVA: 0.16,
    TASA_FINANCIAMIENTO: 0.34
  };

  const [formData, setFormData] = useState({
    // Información básica
    nombre_cotizacion: "", fecha_cotizacion: new Date().toISOString().split('T')[0], valido_hasta: "",
    // Estados
    estado: "Borrador", estado_servicio: "Pendiente", 
    // Configuración
    calculos_automaticos: true, forma_pago: "", metodo_pago: "Efectivo", 
    // Porcentajes
    porcentajes: {
      iva: configFinanciera.IVA * 100,
      financiamiento: configFinanciera.TASA_FINANCIAMIENTO * 100,
      agregado: 0
    },
    // Relaciones
    cliente_id: "", vendedor_id: "", filial_id: "",
    // Detalles técnicos
    detalles: [{
      tipo: "Producto", producto_id: "", cantidad: 1, costo_materiales: 0, utilidad_esperada: 0,inversion_total: 0, precio_venta: 0
    }],
    
    // Financiamiento (condicional)
    financiamiento: undefined,
    
    // Seguimiento (condicional)
    fecha_inicio_servicio: null, fecha_fin_servicio: null
  });

  const [clientes, setClientes] = useState([]);
  const [filials, setFilials] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productosServicios, setProductosServicios] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const fetchedUsuarios = await obtenerUsuarios();
        
        // Mapear usuarios para asegurar consistencia
        const usuariosNormalizados = fetchedUsuarios.map(usuario => ({
          _id: usuario._id,
          name: usuario.name || usuario.nombre || '',
          apellidos: usuario.apellidos || usuario.apellido || ''
        }));
  
        setUsuarios(usuariosNormalizados);
        
        // Seleccionar primer vendedor por defecto si existe
        if (usuariosNormalizados.length > 0) {
          setFormData(prev => ({
            ...prev,
            vendedor_id: usuariosNormalizados[0]._id
          }));
        }
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
      }
    };
    
    fetchUsuarios();
  }, [obtenerUsuarios]);

  const vendedorOptions = usuarios.map(usuario => ({
    value: usuario._id,
    label: usuario.name,
    grupo: usuario.filial_id?.nombre_filial
    
  }))


  useEffect(() => {
    const fetchProductosServicios = async () => {
        try {
            const fetchedProductosServicios = await obtenerProductosServicios();
            setClientes(fetchedProductosServicios);
        } catch (err) {
            console.error("Error al obtener clientes:", err);
        }
    };
    fetchProductosServicios();
}, [obtenerProductosServicios]);
  
//Obtener a los Clientes
      useEffect(() => {
          const fetchClientes = async () => {
              try {
                  const fetchedClientes = await obtenerClientes();
                  setClientes(fetchedClientes);
              } catch (err) {
                  console.error("Error al obtener clientes:", err);
              }
          };
          fetchClientes();
      }, [obtenerClientes]);

      const clientesOptions = clientes.map(cliente => ({
        value: cliente._id,
        label: cliente.nombre,
        grupo: cliente.tipo_cliente
      }))

    //Obtener Filials
      useEffect(() => {
              const cargarFiliales = async () => {
                  try {
                      const data = await obtenerFilials();
                      setFilials(data);
                  } catch (error) {
                      console.error("Error cargando filiales:", error);
                      setAlertType("error");
                      setAlertMessage("Error al cargar las filiales");
                      setShowAlert(true);
                  }
              };
              cargarFiliales();
          }, [obtenerFilials]);

          const filialsOptions = filials.map(filial => ({
            value: filial._id,
            label: filial.nombre_filial,
          }))

  
  const calcularTotales = (detalles, porcentajes, formaPago, financiamiento) => {
    const detallesCalculados = detalles.map(item => {
      // Calcular costo de mano de obra si es aplicable
      let costoManoObra = item.tipo === "ManoObra" ? item.horas * item.tarifa_hora : item.costo_mano_obra;
      const inversion = Number(item.costo_materiales || 0) + Number(costoManoObra || 0);
      const precio = inversion * (1 + (Number(item.utilidad_esperada || 0)/100)) * item.cantidad;
      
      return {
        ...item,
        costo_mano_obra: costoManoObra,
        inversion_total: inversion,
        precio_venta: precio
      };
    });

    // Calcular subtotal
    const subtotal = detallesCalculados.reduce((sum, item) => sum + item.precio_venta, 0);
    const iva = subtotal * (porcentajes.iva / 100);
    const cargoAgregado = subtotal * (porcentajes.agregado / 100);
    let precio_venta = subtotal + iva + cargoAgregado;

    // Manejar financiamiento
    let nuevoFinanciamiento;
    if (formaPago === "Financiado") {
      const cargoFinanciero = precio_venta * (porcentajes.financiamiento / 100);
      precio_venta += cargoFinanciero;
      
      const anticipo = Math.min(
        Number(financiamiento?.anticipo_solicitado) || 0,
        precio_venta
      );
      
      const plazo = Math.max(Number(financiamiento?.plazo_semanas) || 1, 1);
      const saldo = precio_venta - anticipo;
      
      nuevoFinanciamiento = {
        anticipo_solicitado: anticipo,
        plazo_semanas: plazo,
        saldo_restante: Math.max(saldo, 0),
        pago_semanal: plazo > 0 ? saldo / plazo : 0,
        tasa_interes: configFinanciera.TASA_FINANCIAMIENTO,
        fecha_inicio: financiamiento?.fecha_inicio || null
      };

      // Calcular fecha término si hay fecha inicio
      if (nuevoFinanciamiento.fecha_inicio) {
        const fechaTermino = new Date(nuevoFinanciamiento.fecha_inicio);
        fechaTermino.setDate(fechaTermino.getDate() + (plazo * 7));
        nuevoFinanciamiento.fecha_termino = fechaTermino;
      }
    }

    return {
      detalles: detallesCalculados,
      subtotal: parseFloat(subtotal.toFixed(2)),
      iva: parseFloat(iva.toFixed(2)),
      precio_venta: parseFloat(precio_venta.toFixed(2)),
      financiamiento: formaPago === "Financiado" ? nuevoFinanciamiento : undefined
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validación de fechas
      const fechaCotizacion = new Date(formData.fecha_cotizacion);
      const fechaValidoHasta = new Date(formData.valido_hasta);
      
      if (fechaValidoHasta <= fechaCotizacion) {
        throw new Error("La fecha de validez debe ser posterior a la fecha de cotización");
      }
      // Validación de estados
      if (!estadosCotizacion.includes(formData.estado)) {
        throw new Error(`Estado no válido. Use uno de: ${estadosCotizacion.join(", ")}`);
      }
      if (!estadosServicio.includes(formData.estado_servicio)) {
        throw new Error(`Estado de servicio no válido. Use uno de: ${estadosServicio.join(", ")}`);
      }
      // Validaciones básicas
      if (!formData.nombre_cotizacion) {
        throw new Error("El nombre de la cotización es requerido");
      }
      if (!formData.cliente_id) {
        throw new Error("Debe seleccionar un cliente");
      }
      if (!formData.filial_id) {
        throw new Error("Debe seleccionar una filial");
      }
      if (!formData.vendedor_id) {
        throw new Error("Debe seleccionar un vendedor");
      }
      if (!formData.forma_pago) {
        throw new Error("Debe seleccionar una forma de pago");
      }

      // Validar detalles
      for (const detalle of formData.detalles) {
        if (detalle.tipo === "ManoObra" && detalle.horas <= 0) {
          throw new Error("Para ítems de mano de obra, las horas deben ser mayores a 0");
        }
        if (detalle.tipo !== "ManoObra" && !detalle.producto_id) {
          throw new Error("Debe seleccionar un producto/servicio para este ítem");
        }
      }

      // Validar financiamiento si aplica
      if (formData.forma_pago === "Financiado") {
        if (!formData.financiamiento || formData.financiamiento.plazo_semanas < 1) {
          throw new Error("El plazo de financiamiento debe ser de al menos 1 semana");
        }
        if (formData.financiamiento.anticipo_solicitado < 0) {
          throw new Error("El anticipo no puede ser negativo");
        }
      }

      // Validar fechas de servicio según estado
      if (formData.estado_servicio === "En Proceso" && !formData.fecha_inicio_servicio) {
        throw new Error("Debe especificar fecha de inicio cuando el servicio está en proceso");
      }
      
      if (formData.estado_servicio === "Completado") {
        if (!formData.fecha_inicio_servicio) {
          throw new Error("Debe especificar fecha de inicio cuando el servicio está completado");
        }
        if (!formData.fecha_fin_servicio) {
          throw new Error("Debe especificar fecha de finalización cuando el servicio está completado");
        }
        if (new Date(formData.fecha_fin_servicio) < new Date(formData.fecha_inicio_servicio)) {
          throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
        }
      }

      // Preparar datos para enviar
      const dataToSend = {
        nombre_cotizacion: formData.nombre_cotizacion,
        fecha_cotizacion: new Date(formData.fecha_cotizacion),
        valido_hasta: new Date(formData.valido_hasta),
        estado: formData.estado,
        estado_servicio: formData.estado_servicio,
        forma_pago: formData.forma_pago,
        metodo_pago: formData.metodo_pago,
        porcentajes: formData.porcentajes,
        calculos_automaticos: formData.calculos_automaticos,
        cliente_id: formData.cliente_id,
        vendedor_id: formData.vendedor_id,
        filial_id: formData.filial_id,
        detalles: formData.detalles.map(item => ({
          tipo: item.tipo,
          producto_id: item.tipo === "ManoObra" ? undefined : item.producto_id,
          cantidad: item.cantidad,
          costo_materiales: item.costo_materiales,
          utilidad_esperada: item.utilidad_esperada
        })),
        ...(formData.fecha_inicio_servicio && {
          fecha_inicio_servicio: new Date(formData.fecha_inicio_servicio)
        }),
        ...(formData.fecha_fin_servicio && {
          fecha_fin_servicio: new Date(formData.fecha_fin_servicio)
        }),
        ...(formData.forma_pago === "Financiado" && {
          financiamiento: {
            anticipo_solicitado: formData.financiamiento.anticipo_solicitado,
            plazo_semanas: formData.financiamiento.plazo_semanas,
            ...(formData.financiamiento.fecha_inicio && {
              fecha_inicio: new Date(formData.financiamiento.fecha_inicio)
            })
          }
        })
      };

      // Enviar datos
      const response = await crearCotizacion(dataToSend);
      
      // Manejar respuesta exitosa
      setAlertType("success");
      setAlertMessage("Cotización creada exitosamente");
      setShowAlert(true);
      
      setTimeout(() => navigate(`/cotizaciones/ver/${response._id}`), 2000);
      
    } catch (error) {
      console.error("Error al crear cotización:", error);
      setAlertType("error");
      setAlertMessage(
        error.response?.data?.error || 
        error.response?.data?.message || 
        error.message || 
        "Error al crear la cotización"
      );
      setShowAlert(true);
    }
  };

  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    if (name.startsWith("porcentajes.")) {
      const field = name.split('.')[1];
      const newPorcentajes = {
        ...formData.porcentajes,
        [field]: type === 'number' ? Number(value) || 0 : value
      };
      
      const nuevosTotales = calcularTotales(
        formData.detalles, newPorcentajes, formData.forma_pago, formData.financiamiento
      );
      
      setFormData(prev => ({
        ...prev,
        porcentajes: newPorcentajes,
        ...nuevosTotales
      }));
    }
    else if (name.startsWith("financiamiento.")) {
      const field = name.split('.')[1];
      const newFinanciamiento = {
        ...(formData.financiamiento || {}),
        [field]: type === 'number' ? Number(value) || 0 : value
      };
      
      const nuevosTotales = calcularTotales(
        formData.detalles, formData.porcentajes, formData.forma_pago, newFinanciamiento
      );
      
      setFormData(prev => ({
        ...prev,
        financiamiento: newFinanciamiento,
        ...nuevosTotales
      }));
    } 
    else if (index !== undefined) {
      // Manejo de detalles
      const detalles = formData.detalles.map((item, i) => {
        if (i === index) {
          const updatedItem = { 
            ...item, 
            [name]: type === 'number' ? Number(value) || 0 : value 
          };
          
          // Si cambia el tipo, resetear algunos campos
          if (name === "tipo") {
            if (value === "ManoObra") {
              updatedItem.producto_id = "";
              updatedItem.cantidad = 1;
              updatedItem.horas = 1;
              updatedItem.costo_materiales = 0;
            } else {
              updatedItem.horas = 0;
              updatedItem.tarifa_hora = configFinanciera.TARIFA_MANO_OBRA;
            }
          }
          
          // Si selecciona un producto, cargar sus datos
          if (name === "producto_id" && value) {
            const producto = productosServicios.find(p => p._id === value);
            if (producto) {
              updatedItem.descripcion = producto.nombre;
              updatedItem.costo_materiales = producto.precio;
            }
          }
          
          return updatedItem;
        }
        return item;
      });
      
      const nuevosTotales = calcularTotales(
        detalles,
        formData.porcentajes, formData.forma_pago, formData.financiamiento
      );
      
      setFormData(prev => ({ 
        ...prev,
        detalles: nuevosTotales.detalles,
        subtotal: nuevosTotales.subtotal,
        iva: nuevosTotales.iva,
        precio_venta: nuevosTotales.precio_venta,
        financiamiento: nuevosTotales.financiamiento
      }));
    } else {
      const newValue = type === 'number' ? Number(value) || 0 : value;
      
      // Si cambia la forma de pago, manejar financiamiento
      if (name === "forma_pago") {
        const nuevosTotales = calcularTotales(
          formData.detalles,
          formData.porcentajes,
          newValue,
          newValue === "Financiado" ? {
            anticipo_solicitado: 0,
            plazo_semanas: 1,
            fecha_inicio: null
          } : undefined
        );
        
        setFormData(prev => ({
          ...prev,
          [name]: newValue,
          ...nuevosTotales
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          [name]: newValue
        }));
      }
    }
  };

  const handleAddItem = () => {
    setFormData(prev => {
      const nuevosTotales = calcularTotales(
        [...prev.detalles, { 
          tipo: "Producto",
          producto_id: "",
          cantidad: 1,
          costo_materiales: 0, 
          utilidad_esperada: 0
        }],
        prev.porcentajes,
        prev.forma_pago,
        prev.financiamiento
      );
      
      return {
        ...prev,
        detalles: nuevosTotales.detalles,
        subtotal: nuevosTotales.subtotal,
        iva: nuevosTotales.iva,
        precio_venta: nuevosTotales.precio_venta,
        financiamiento: nuevosTotales.financiamiento
      };
    });
  };

  const handleRemoveItem = (index) => {
    const detalles = formData.detalles.filter((_, i) => i !== index);
    
    const nuevosTotales = calcularTotales(
      detalles,
      formData.porcentajes, formData.forma_pago, formData.financiamiento
    );
    
    setFormData(prev => ({ 
      ...prev,
      detalles: nuevosTotales.detalles,
      subtotal: nuevosTotales.subtotal,
      iva: nuevosTotales.iva,
      precio_venta: nuevosTotales.precio_venta,
      financiamiento: nuevosTotales.financiamiento
    }));
  };

  const handleAlertClose = () => {
    setShowAlert(false);
  };

  return (
    <Layout>
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <div className="invoice-title d-flex justify-content-between align-items-center">
                <h3 className="font-size-h4">Crear una Cotización</h3>
                <div className="mb-6">
                  <img src="/assets/images/logo-dark.png" alt="logo" height="25" className="logo-dark" />  
                  <img src="/assets/images/logo-light.png" alt="logo" height="25" className="logo-light" />
                </div>
              </div>
              <hr className="my-4" />

              <form onSubmit={handleSubmit}>
                {/* Sección de datos básicos */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Título de Cotización *</label>
                      <input type="text" className="form-control" name="nombre_cotizacion" 
                        value={formData.nombre_cotizacion} onChange={handleChange} 
                        required  maxLength="100"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Fecha de Cotización</label>
                      <input type="date" className="form-control" name="fecha_cotizacion"
                        value={formData.fecha_cotizacion} onChange={handleChange} required
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Válido hasta *</label>
                      <input type="date" className="form-control" name="valido_hasta" 
                        value={formData.valido_hasta} onChange={handleChange} required
                      />
                    </div>
                  </div>
                </div>

                {/* Sección de estados y pagos */}
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Estado Cotización</label>
                      <select className="form-select" name="estado" 
                        value={formData.estado} onChange={handleChange}
                      >
                        {estadosCotizacion.map((estado) => (
                          <option key={estado} value={estado}>{estado}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Estado Servicio</label>
                      <select  className="form-select"  name="estado_servicio" 
                        value={formData.estado_servicio} onChange={handleChange}
                      >
                        {estadosServicio.map((estado) => (
                          <option key={estado} value={estado}>{estado}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Forma de Pago *</label>
                      <select className="form-select" name="forma_pago" 
                        value={formData.forma_pago} onChange={handleChange}  required
                      >
                        <option value="">Seleccione...</option>
                        {formasPago.map((forma) => (
                          <option key={forma} value={forma}>{forma}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Método de Pago *</label>
                      <select className="form-select" name="metodo_pago" 
                        value={formData.metodo_pago} onChange={handleChange} required
                      >
                        {metodosPago.map((metodo) => (
                          <option key={metodo} value={metodo}>{metodo}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Fechas de servicio - Mostrar según estado */}
                {formData.estado_servicio === "En Proceso" && (
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Fecha Inicio Servicio *</label>
                        <input type="date" className="form-control" name="fecha_inicio_servicio"
                          value={formData.fecha_inicio_servicio || ""} onChange={handleChange} required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.estado_servicio === "Completado" && (
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Fecha Inicio Servicio *</label>
                        <input type="date" className="form-control" name="fecha_inicio_servicio"
                          value={formData.fecha_inicio_servicio || ""} onChange={handleChange} required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Fecha Fin Servicio *</label>
                        <input type="date" className="form-control" name="fecha_fin_servicio"
                          value={formData.fecha_fin_servicio || ""} onChange={handleChange} required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Relaciones */}
                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <SelectGroup
                      name="cliente_id" label="Cliente" class=""
                      value={formData.cliente_id} onChange={(e) => setFormData({...formData, cliente_id: e.target.value})}
                       options={clientesOptions} groupBy="grupo" required/>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                    <SelectGroup
                      name="filial_id" label="Filial" class=""
                      value={formData.filial_id} onChange={(e) => setFormData({...formData, filial_id: e.target.value})}
                       options={filialsOptions} groupBy="grupo" required/>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                    <SelectGroup
                      name="vendedor_id" label="Vendedor" class=""
                      value={formData.vendedor_id} onChange={(e) => setFormData({...formData, usuario_id: e.target.value})}
                       options={vendedorOptions} groupBy="grupo" required/>
                    </div>
                  </div>
                </div>

                {/* Sección de porcentajes */}
                <div className="row mb-4 border-top pt-3">
                  <div className="col-md-12">
                    <h5>Configuración de Porcentajes</h5>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="mb-3">
                          <label className="form-label">IVA (%)</label>
                          <input type="number" className="form-control" name="porcentajes.iva"
                            value={formData.porcentajes.iva} onChange={handleChange}
                            min="0" max="100" step="0.1"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="mb-3">
                          <label className="form-label">Tasa Financiamiento (%)</label>
                          <input type="number" className="form-control" name="porcentajes.financiamiento"
                            value={formData.porcentajes.financiamiento} onChange={handleChange}
                            min="0" step="0.1"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="mb-3">
                          <label className="form-label">Cargo Adicional (%)</label>
                          <input type="number" className="form-control" name="porcentajes.agregado"
                            value={formData.porcentajes.agregado} onChange={handleChange}
                            min="0" step="0.1"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check mt-4 pt-2">
                          <input type="checkbox" className="form-check-input" name="calculos_automaticos"
                            checked={formData.calculos_automaticos} onChange={handleChange}
                            id="calculosAutomaticosCheck"
                          />
                          <label className="form-check-label" htmlFor="calculosAutomaticosCheck">
                            Cálculos Automáticos
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección de detalles */}
                <div className="py-2 mt-3 mb-4">
                  <h5 className="font-size-15">Detalles de la Cotización</h5>
                  <div className="table-responsive">
                    <table className="table table-nowrap table-centered mb-0">
                      <thead>
                        <tr>
                          <th>Tipo *</th>
                          <th>Producto/Servicio</th>
                          <th>Cantidad</th>
                          <th>Costo Materiales</th>
                          <th>Utilidad (%)</th>
                          <th>Inversión Total</th>
                          <th>Precio Venta</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.detalles.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <select className="form-select" name="tipo"
                                value={item.tipo} onChange={(e) => handleChange(e, index)} required
                              >
                                {tiposItem.map((tipo) => (
                                  <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                              </select>
                            </td>
                            <td>
                              {item.tipo !== "ManoObra" ? (
                                <select className="form-select" name="producto_id"
                                  value={item.producto_id} onChange={(e) => handleChange(e, index)}
                                  required={item.tipo !== "ManoObra"}
                                >
                                  <option value="">Seleccione...</option>
                                  {productosServicios
                                    .filter(p => p.tipo === item.tipo)
                                    .map((producto) => (
                                      <option key={producto._id} value={producto._id}>
                                        {producto.nombre} (${producto.precio})
                                      </option>
                                    ))}
                                </select>
                              ) : (
                                <input type="text" className="form-control"  value="Mano de Obra" disabled />
                              )}
                            </td>
                            <td>
                              <input type="number" className="form-control" name="cantidad" 
                                value={item.cantidad} onChange={(e) => handleChange(e, index)} 
                                min="1" required 
                              />
                            </td>
                            
                            <td>
                              <input type="number" className="form-control" name="costo_materiales" 
                                value={item.costo_materiales} onChange={(e) => handleChange(e, index)} 
                                min="0" step="0.01"
                                disabled={item.tipo === "ManoObra"} required={item.tipo !== "ManoObra"}
                              />
                            </td>
                            
                            <td>
                              <input 
                                type="number"  className="form-control"  name="utilidad_esperada" 
                                value={item.utilidad_esperada} onChange={(e) => handleChange(e, index)}
                                min="0" max="100" step="1"
                              />
                            </td>
                            <td>
                              <input  type="number" className="form-control" value={(item.inversion_total || 0).toFixed(2)} disabled />
                            </td>
                            <td>
                              <input type="number" className="form-control" value={(item.precio_venta || 0).toFixed(2)} disabled />
                            </td>
                            <td>
                              <button type="button" className="btn btn-danger btn-sm" 
                                onClick={() => handleRemoveItem(index)}  disabled={formData.detalles.length <= 1}>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button 
                    type="button" className="btn btn-primary mt-2" 
                    onClick={handleAddItem}
                  >
                    Agregar Detalle
                  </button>
                </div>

                {/* Sección de totales */}
                <div className="row mt-3 mb-4 border-top pt-3">
                  <div className="col-md-4 offset-md-4">
                    <div className="table-responsive">
                      <table className="table table-sm table-borderless">
                        <tbody>
                          <tr>
                            <th>Subtotal:</th>
                            <td className="text-end">${(formData.subtotal || 0).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <th>IVA ({formData.porcentajes.iva}%):</th>
                            <td className="text-end">${(formData.iva || 0).toFixed(2)}</td>
                          </tr>
                          {formData.porcentajes.agregado > 0 && (
                            <tr>
                              <th>Cargo Adicional ({formData.porcentajes.agregado}%):</th>
                              <td className="text-end">
                                ${((formData.subtotal * formData.porcentajes.agregado) / 100).toFixed(2)}
                              </td>
                            </tr>
                          )}
                          {formData.forma_pago === "Financiado" && (
                            <tr>
                              <th>Interés Financiero ({formData.porcentajes.financiamiento}%):</th>
                              <td className="text-end">
                                ${((formData.subtotal * formData.porcentajes.financiamiento) / 100).toFixed(2)}
                              </td>
                            </tr>
                          )}
                          <tr className="border-top">
                            <th>Total:</th>
                            <td className="text-end fw-bold">${(formData.precio_venta || 0).toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                {/* Sección de financiamiento */}
                {formData.forma_pago === "Financiado" && formData.financiamiento && (
                  <div className="row mt-3 border-top pt-3 mb-4">
                    <div className="col-md-12">
                      <h5>Datos de Financiamiento</h5>    
                      <div className="row">
                        <div className="col-md-3">
                          <div className="mb-3">
                            <label className="form-label">Anticipo *</label>
                            <input type="number" className="form-control" name="financiamiento.anticipo_solicitado" 
                              value={formData.financiamiento.anticipo_solicitado} onChange={handleChange}
                              min="0" max={formData.precio_venta} step="0.01" required
                            />
                            <small className="text-muted">Máximo: ${formData.precio_venta.toFixed(2)}</small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="mb-3">
                            <label className="form-label">Plazo (semanas) *</label>
                            <input  type="number" className="form-control"  name="financiamiento.plazo_semanas" 
                              value={formData.financiamiento.plazo_semanas} onChange={handleChange} min="1" required
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="mb-3">
                            <label className="form-label">Pago Semanal</label>
                            <input type="number"  className="form-control" 
                              value={(formData.financiamiento.pago_semanal || 0).toFixed(2)}  disabled 
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="mb-3">
                            <label className="form-label">Saldo Restante</label>
                            <input type="number" className="form-control" 
                              value={formData.financiamiento.saldo_restante.toFixed(2)}  disabled 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row mt-2">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Fecha Inicio Financiamiento</label>
                            <input type="date" className="form-control" name="financiamiento.fecha_inicio"
                              value={formData.financiamiento.fecha_inicio || ""} onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Fecha Término Financiamiento</label>
                            <input type="date" className="form-control" value={formData.financiamiento.fecha_termino || ""} disabled
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón de envío */}
                <div className="d-print-none mt-4">
                  <div className="float-end">
                    <button  type="submit"  className="btn btn-primary w-md waves-effect waves-light"
                    disabled={!formData.detalles.some(d => d.producto_id !== "" || d.tipo === "ManoObra")}                    >
                      Crear Cotización
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alertas */}
      {showAlert && (
        <AlertComponent
          type={alertType} entity="Cotización"
          action={alertType === "success" ? "create" : "error"}
          onCancel={handleAlertClose} message={alertMessage}
          
        />
      )}
    </Layout>
  );
};

export default CrearCotizacion;