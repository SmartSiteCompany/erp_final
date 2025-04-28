const mongoose = require('mongoose');
const Cotizacion = require('../models/Cotizacion');
const Catalogo = require('../models/Catalogo');
const EstadoCuenta = require('../models/EstadoCuenta');
const Pago = require('../models/Pago');
const { configFinanciera, estadosCotizacion, formasPago } = require('../utils/constantes');
const XLSX = require('xlsx');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { format } = require('date-fns');

// ==============================================
// 1. Helpers y Middlewares
// ==============================================

const handleError = (res, error, statusCode = 500) => {
  console.error(error);
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Error en el servidor'
  });
};

exports.verificarCotizacion = async (req, res, next) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id)
      .populate('cliente_id', 'nombre email telefono')
      .populate('filial_id', 'nombre direccion');

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        error: 'Cotización no encontrada'
      });
    }

    req.cotizacion = cotizacion;
    next();
  } catch (error) {
    handleError(res, error);
  }
};

// ==============================================
// 2. Operaciones CRUD Básicas
// ==============================================

exports.obtenerCotizaciones = async (req, res) => {
  try {
    const { estado, cliente_id, fecha_inicio, fecha_fin } = req.query;
    const filtro = {};

    if (estado) filtro.estado = estado;
    if (cliente_id) filtro.cliente_id = cliente_id;
    if (fecha_inicio && fecha_fin) {
      filtro.fecha_cotizacion = {
        $gte: new Date(fecha_inicio),
        $lte: new Date(fecha_fin)
      };
    }

    const cotizaciones = await Cotizacion.find(filtro)
      .populate('cliente_id', 'nombre email')
      .populate('filial_id', 'nombre direccion')
      .sort({ fecha_cotizacion: -1 });

    res.json({
      success: true,
      count: cotizaciones.length,
      data: cotizaciones
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.obtenerCotizacionPorId = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id)
      .populate('cliente_id')
      .populate('filial_id')
      .populate('detalles.producto_id')
      .populate('pago_contado_id')
      .populate('financiamiento.pagos_ids');

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        error: 'Cotización no encontrada'
      });
    }

    res.json({
      success: true,
      data: cotizacion
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.crearCotizacion = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { detalles, porcentajes, forma_pago, ...datosCotizacion } = req.body;

    // Validación básica
    if (!detalles || detalles.length === 0) {
      throw new Error('Debe incluir al menos un ítem');
    }

    // Procesar detalles
    const detallesProcesados = await Promise.all(
      detalles.map(async (detalle) => {
        if (detalle.tipo === 'ManoObra') {
          return {
            ...detalle,
            precio_venta: detalle.horas * detalle.tarifa_hora
          };
        } else {
          const producto = await Catalogo.findById(detalle.producto_id);
          return {
            ...detalle,
            precio_venta: producto.precio * detalle.cantidad
          };
        }
      })
    );

    // Calcular totales
    const subtotal = detallesProcesados.reduce((sum, item) => sum + item.precio_venta, 0);
    const iva = subtotal * (porcentajes?.iva || 0) / 100;
    const total = subtotal + iva;

    // Crear cotización
    const cotizacion = new Cotizacion({
      ...datosCotizacion,
      detalles: detallesProcesados,
      porcentajes: porcentajes || {
        iva: configFinanciera.IVA * 100,
        financiamiento: configFinanciera.TASA_FINANCIAMIENTO * 100,
        agregado: 0
      },
      subtotal,
      iva,
      precio_venta: total,
      forma_pago,
      creado_por: req.user._id
    });

    await cotizacion.save({ session });

    // Manejo de pagos según tipo
    if (forma_pago === 'Contado') {
      const pago = new Pago({
        monto: total,
        metodo_pago: 'Efectivo',
        cotizacion_id: cotizacion._id,
        cliente_id: cotizacion.cliente_id
      });

      await pago.save({ session });
      cotizacion.pago_contado_id = pago._id;
      await cotizacion.save({ session });
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: cotizacion
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 400);
  } finally {
    session.endSession();
  }
};

exports.actualizarCotizacion = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { detalles, porcentajes, ...datosActualizados } = req.body;
    const cotizacion = await Cotizacion.findById(req.params.id).session(session);

    if (!cotizacion) {
      throw new Error('Cotización no encontrada');
    }

    // Validar que no esté completada
    if (cotizacion.estado === 'Completada') {
      throw new Error('No se puede modificar una cotización completada');
    }

    // Actualizar detalles si se proporcionan
    if (detalles) {
      cotizacion.detalles = await Promise.all(
        detalles.map(async (detalle) => {
          if (detalle.tipo === 'ManoObra') {
            return {
              ...detalle,
              precio_venta: detalle.horas * detalle.tarifa_hora
            };
          } else {
            const producto = await Catalogo.findById(detalle.producto_id);
            return {
              ...detalle,
              precio_venta: producto.precio * detalle.cantidad
            };
          }
        })
      );
    }

    // Actualizar porcentajes si se proporcionan
    if (porcentajes) {
      cotizacion.porcentajes = porcentajes;
    }

    // Recalcular totales si es automático
    if (cotizacion.calculos_automaticos) {
      const subtotal = cotizacion.detalles.reduce((sum, item) => sum + item.precio_venta, 0);
      const iva = subtotal * (cotizacion.porcentajes.iva / 100);
      cotizacion.subtotal = subtotal;
      cotizacion.iva = iva;
      cotizacion.precio_venta = subtotal + iva;
    }

    // Guardar cambios
    Object.assign(cotizacion, datosActualizados);
    cotizacion.actualizado_por = req.user._id;
    await cotizacion.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: cotizacion
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 400);
  } finally {
    session.endSession();
  }
};

exports.eliminarCotizacion = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cotizacion = await Cotizacion.findById(req.params.id).session(session);

    if (!cotizacion) {
      throw new Error('Cotización no encontrada');
    }

    // Validar que no tenga servicios iniciados
    if (cotizacion.estado_servicio !== 'Pendiente') {
      throw new Error('No se puede eliminar una cotización con servicios activos');
    }

    // Eliminar pagos asociados
    if (cotizacion.pago_contado_id) {
      await Pago.findByIdAndDelete(cotizacion.pago_contado_id).session(session);
    }

    if (cotizacion.forma_pago === 'Financiado' && cotizacion.financiamiento?.pagos_ids?.length > 0) {
      await Pago.deleteMany({ _id: { $in: cotizacion.financiamiento.pagos_ids } }).session(session);
      await EstadoCuenta.deleteOne({ cotizacion_id: cotizacion._id }).session(session);
    }

    await Cotizacion.findByIdAndDelete(req.params.id).session(session);
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Cotización eliminada correctamente'
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 400);
  } finally {
    session.endSession();
  }
};

// ==============================================
// 3. Gestión de Porcentajes y Cálculos
// ==============================================

exports.actualizarPorcentajes = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { iva, financiamiento, agregado } = req.body;
    const cotizacion = await Cotizacion.findById(req.params.id).session(session);

    if (!cotizacion) {
      throw new Error('Cotización no encontrada');
    }

    // Validar rangos
    if (iva && (iva < 0 || iva > 100)) {
      throw new Error('El IVA debe estar entre 0 y 100%');
    }

    // Actualizar porcentajes
    cotizacion.porcentajes = {
      iva: iva || cotizacion.porcentajes.iva,
      financiamiento: financiamiento || cotizacion.porcentajes.financiamiento,
      agregado: agregado || cotizacion.porcentajes.agregado
    };

    // Recalcular si es automático
    if (cotizacion.calculos_automaticos) {
      const subtotal = cotizacion.detalles.reduce((sum, item) => sum + item.precio_venta, 0);
      const ivaCalculado = subtotal * (cotizacion.porcentajes.iva / 100);
      const cargoFinanciero = cotizacion.forma_pago === 'Financiado' 
        ? subtotal * (cotizacion.porcentajes.financiamiento / 100)
        : 0;
      const cargoAgregado = subtotal * (cotizacion.porcentajes.agregado / 100);

      cotizacion.subtotal = subtotal;
      cotizacion.iva = ivaCalculado;
      cotizacion.precio_venta = subtotal + ivaCalculado + cargoFinanciero + cargoAgregado;
    }

    await cotizacion.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      data: cotizacion
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 400);
  } finally {
    session.endSession();
  }
};

exports.toggleCalculoAutomatico = async (req, res) => {
  try {
    const { estado } = req.body;
    const cotizacion = await Cotizacion.findByIdAndUpdate(
      req.params.id,
      { calculos_automaticos: estado },
      { new: true }
    );

    res.json({
      success: true,
      data: cotizacion
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==============================================
// 4. Gestión de Mano de Obra
// ==============================================

exports.agregarManoObra = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { horas, tarifa_hora, descripcion, utilidad_esperada = 0 } = req.body;
    const cotizacion = await Cotizacion.findById(req.params.id).session(session);

    if (!cotizacion) {
      throw new Error('Cotización no encontrada');
    }

    const nuevoItem = {
      tipo: 'ManoObra',
      horas,
      tarifa_hora,
      descripcion,
      utilidad_esperada,
      precio_venta: horas * tarifa_hora * (1 + utilidad_esperada / 100)
    };

    cotizacion.detalles.push(nuevoItem);

    // Recalcular totales si es automático
    if (cotizacion.calculos_automaticos) {
      const subtotal = cotizacion.detalles.reduce((sum, item) => sum + item.precio_venta, 0);
      const iva = subtotal * (cotizacion.porcentajes.iva / 100);
      cotizacion.subtotal = subtotal;
      cotizacion.iva = iva;
      cotizacion.precio_venta = subtotal + iva;
    }

    await cotizacion.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      data: cotizacion
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 400);
  } finally {
    session.endSession();
  }
};

exports.actualizarManoObra = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { itemId } = req.params;
    const { horas, tarifa_hora, descripcion } = req.body;
    const cotizacion = await Cotizacion.findById(req.params.id).session(session);

    if (!cotizacion) {
      throw new Error('Cotización no encontrada');
    }

    const itemIndex = cotizacion.detalles.findIndex(
      item => item._id.toString() === itemId && item.tipo === 'ManoObra'
    );

    if (itemIndex === -1) {
      throw new Error('Ítem de mano de obra no encontrado');
    }

    // Actualizar item
    cotizacion.detalles[itemIndex] = {
      ...cotizacion.detalles[itemIndex],
      horas,
      tarifa_hora,
      descripcion,
      precio_venta: horas * tarifa_hora
    };

    // Recalcular totales si es automático
    if (cotizacion.calculos_automaticos) {
      const subtotal = cotizacion.detalles.reduce((sum, item) => sum + item.precio_venta, 0);
      const iva = subtotal * (cotizacion.porcentajes.iva / 100);
      cotizacion.subtotal = subtotal;
      cotizacion.iva = iva;
      cotizacion.precio_venta = subtotal + iva;
    }

    await cotizacion.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      data: cotizacion
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 400);
  } finally {
    session.endSession();
  }
};

exports.eliminarManoObra = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { itemId } = req.params;
    const cotizacion = await Cotizacion.findById(req.params.id).session(session);

    if (!cotizacion) {
      throw new Error('Cotización no encontrada');
    }

    const itemIndex = cotizacion.detalles.findIndex(
      item => item._id.toString() === itemId && item.tipo === 'ManoObra'
    );

    if (itemIndex === -1) {
      throw new Error('Ítem de mano de obra no encontrado');
    }

    // Eliminar item
    cotizacion.detalles.splice(itemIndex, 1);

    // Recalcular totales si es automático
    if (cotizacion.calculos_automaticos) {
      const subtotal = cotizacion.detalles.reduce((sum, item) => sum + item.precio_venta, 0);
      const iva = subtotal * (cotizacion.porcentajes.iva / 100);
      cotizacion.subtotal = subtotal;
      cotizacion.iva = iva;
      cotizacion.precio_venta = subtotal + iva;
    }

    await cotizacion.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      data: cotizacion
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 400);
  } finally {
    session.endSession();
  }
};

// ==============================================
// 5. Operaciones de Estado
// ==============================================

exports.actualizarEstado = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { estado } = req.body;
    const cotizacion = await Cotizacion.findById(req.params.id).session(session);

    if (!cotizacion) {
      throw new Error('Cotización no encontrada');
    }

    // Validar transición de estados
    const transicionesPermitidas = {
      Borrador: ['Enviada', 'Cancelada'],
      Enviada: ['Aprobada', 'Cancelada'],
      Aprobada: ['Completada']
    };

    if (!transicionesPermitidas[cotizacion.estado]?.includes(estado)) {
      throw new Error('Transición de estado no permitida');
    }

    cotizacion.estado = estado;

    // Si se aprueba y es financiado, generar pagos programados
    if (estado === 'Aprobada' && cotizacion.forma_pago === 'Financiado') {
      await generarPagosFinanciamiento(cotizacion, session);
    }

    await cotizacion.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      data: cotizacion
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 400);
  } finally {
    session.endSession();
  }
};

exports.activarServicio = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findByIdAndUpdate(
      req.params.id,
      {
        estado_servicio: 'En Proceso',
        fecha_inicio_servicio: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      data: cotizacion
    });
  } catch (error) {
    handleError(res, error);
  }
};

exports.completarServicio = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findByIdAndUpdate(
      req.params.id,
      {
        estado_servicio: 'Completado',
        estado: 'Completada',
        fecha_fin_servicio: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      data: cotizacion
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==============================================
// 6. Operaciones de Pagos
// ==============================================

exports.registrarPago = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { monto, metodo_pago, tipo_pago } = req.body;
    const cotizacion = await Cotizacion.findById(req.params.id).session(session);

    if (!cotizacion) {
      throw new Error('Cotización no encontrada');
    }

    // Validar tipo de pago según forma de pago
    if (cotizacion.forma_pago === 'Contado' && tipo_pago !== 'Contado') {
      throw new Error('Solo se aceptan pagos de contado para esta cotización');
    }

    // Crear pago
    const pago = new Pago({
      monto,
      metodo_pago,
      tipo_pago,
      cotizacion_id: cotizacion._id,
      cliente_id: cotizacion.cliente_id
    });

    await pago.save({ session });

    // Actualizar cotización
    if (cotizacion.forma_pago === 'Financiado') {
      if (!cotizacion.financiamiento.pagos_ids) {
        cotizacion.financiamiento.pagos_ids = [];
      }
      cotizacion.financiamiento.pagos_ids.push(pago._id);
      cotizacion.financiamiento.saldo_restante -= monto;

      // Actualizar estado de cuenta
      await EstadoCuenta.findOneAndUpdate(
        { cotizacion_id: cotizacion._id },
        {
          $push: { pagos_ids: pago._id },
          $inc: { saldo_actual: -monto }
        },
        { session }
      );
    }

    await cotizacion.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        cotizacion,
        pago
      }
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 400);
  } finally {
    session.endSession();
  }
};

exports.obtenerHistorialPagos = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id)
      .populate('financiamiento.pagos_ids');

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        error: 'Cotización no encontrada'
      });
    }

    const pagos = cotizacion.forma_pago === 'Contado' && cotizacion.pago_contado_id
      ? [await Pago.findById(cotizacion.pago_contado_id)]
      : cotizacion.financiamiento?.pagos_ids || [];

    res.json({
      success: true,
      data: pagos
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==============================================
// 7. Operaciones de Catálogo (Excel)
// ==============================================

exports.cargarCatalogo = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const productos = XLSX.utils.sheet_to_json(worksheet);

    // Validar estructura mínima
    const requiredFields = ['codigo', 'nombre', 'precio', 'categoria'];
    const missingFields = requiredFields.filter(
      field => !productos[0] || productos[0][field] === undefined
    );

    if (missingFields.length > 0) {
      throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
    }

    // Procesar productos
    const productosProcesados = productos.map(producto => ({
      codigo: producto.codigo,
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: producto.categoria,
      descripcion: producto.descripcion || '',
      unidad_medida: producto.unidad_medida || '',
      activo: true
    }));

    // Eliminar catálogo existente e insertar nuevo
    await Catalogo.deleteMany({}).session(session);
    await Catalogo.insertMany(productosProcesados, { session });

    // Eliminar archivo temporal
    fs.unlinkSync(req.file.path);

    await session.commitTransaction();

    res.json({
      success: true,
      count: productosProcesados.length
    });
  } catch (error) {
    await session.abortTransaction();
    if (req.file?.path) fs.unlinkSync(req.file.path);
    handleError(res, error, 400);
  } finally {
    session.endSession();
  }
};

exports.obtenerCatalogo = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id);
    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        error: 'Cotización no encontrada'
      });
    }

    const productos = await Catalogo.find({ activo: true });
    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==============================================
// 8. Reportes
// ==============================================

exports.generarReportePDF = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id)
      .populate('cliente_id')
      .populate('filial_id')
      .populate('detalles.producto_id');

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        error: 'Cotización no encontrada'
      });
    }

    const doc = new PDFDocument();
    const fileName = `cotizacion_${cotizacion.id_manual}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text(`Cotización #${cotizacion.id_manual}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${format(cotizacion.fecha_cotizacion, 'dd/MM/yyyy')}`);
    doc.text(`Cliente: ${cotizacion.cliente_id.nombre}`);
    doc.text(`Filial: ${cotizacion.filial_id.nombre}`);
    doc.moveDown();

    // Detalles
    doc.fontSize(14).text('Detalles:', { underline: true });
    doc.moveDown();

    let yPosition = doc.y;
    const tableHeaders = ['Descripción', 'Cantidad', 'Precio Unitario', 'Total'];
    const columnPositions = [50, 250, 350, 450];

    // Encabezados de tabla
    doc.font('Helvetica-Bold');
    tableHeaders.forEach((header, i) => {
      doc.text(header, columnPositions[i], yPosition);
    });
    doc.font('Helvetica');

    // Línea divisoria
    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();

    // Items
    cotizacion.detalles.forEach(item => {
      yPosition += 25;
      doc.text(item.descripcion, columnPositions[0], yPosition);
      doc.text(item.cantidad.toString(), columnPositions[1], yPosition);
      doc.text(`$${item.precio_venta.toFixed(2)}`, columnPositions[2], yPosition);
      doc.text(`$${(item.precio_venta * item.cantidad).toFixed(2)}`, columnPositions[3], yPosition);
    });

    // Totales
    yPosition += 40;
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', columnPositions[2], yPosition);
    doc.text(`$${cotizacion.subtotal.toFixed(2)}`, columnPositions[3], yPosition);

    yPosition += 25;
    doc.text('IVA:', columnPositions[2], yPosition);
    doc.text(`$${cotizacion.iva.toFixed(2)}`, columnPositions[3], yPosition);

    yPosition += 25;
    doc.text('Total:', columnPositions[2], yPosition);
    doc.text(`$${cotizacion.precio_venta.toFixed(2)}`, columnPositions[3], yPosition);

    doc.end();
  } catch (error) {
    handleError(res, error);
  }
};

exports.generarReporteExcel = async (req, res) => {
  try {
    const cotizacion = await Cotizacion.findById(req.params.id)
      .populate('cliente_id')
      .populate('filial_id')
      .populate('detalles.producto_id');

    if (!cotizacion) {
      return res.status(404).json({
        success: false,
        error: 'Cotización no encontrada'
      });
    }

    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      ['Cotización', cotizacion.id_manual],
      ['Fecha', format(cotizacion.fecha_cotizacion, 'dd/MM/yyyy')],
      ['Cliente', cotizacion.cliente_id.nombre],
      ['Filial', cotizacion.filial_id.nombre],
      [],
      ['Descripción', 'Cantidad', 'Precio Unitario', 'Total']
    ];

    // Agregar items
    cotizacion.detalles.forEach(item => {
      worksheetData.push([
        item.descripcion,
        item.cantidad,
        item.precio_venta,
        item.precio_venta * item.cantidad
      ]);
    });

    // Agregar totales
    worksheetData.push([]);
    worksheetData.push(['Subtotal:', '', '', cotizacion.subtotal]);
    worksheetData.push(['IVA:', '', '', cotizacion.iva]);
    worksheetData.push(['Total:', '', '', cotizacion.precio_venta]);

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cotización');

    const fileName = `cotizacion_${cotizacion.id_manual}.xlsx`;
    const filePath = `./temp/${fileName}`;

    // Crear directorio temp si no existe
    if (!fs.existsSync('./temp')) {
      fs.mkdirSync('./temp');
    }

    XLSX.writeFile(workbook, filePath);

    res.download(filePath, fileName, (err) => {
      if (err) throw err;
      fs.unlinkSync(filePath); // Eliminar archivo temporal
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==============================================
// 9. Funciones Auxiliares
// ==============================================

async function generarPagosFinanciamiento(cotizacion, session) {
  const { anticipo_solicitado, plazo_semanas, tasa_interes } = cotizacion.financiamiento;
  const fechaInicio = new Date();
  const pagos = [];

  // Crear pago inicial (anticipo)
  if (anticipo_solicitado > 0) {
    const pagoInicial = new Pago({
      monto: anticipo_solicitado,
      tipo_pago: 'Anticipo',
      cotizacion_id: cotizacion._id,
      cliente_id: cotizacion.cliente_id,
      fecha_pago: fechaInicio
    });
    await pagoInicial.save({ session });
    pagos.push(pagoInicial._id);
  }

  // Crear pagos programados
  const pagoSemanal = (cotizacion.precio_venta - anticipo_solicitado) / plazo_semanas;
  for (let i = 1; i <= plazo_semanas; i++) {
    const fechaPago = new Date(fechaInicio);
    fechaPago.setDate(fechaPago.getDate() + (i * 7));

    const pago = new Pago({
      monto: pagoSemanal,
      tipo_pago: 'Abono',
      cotizacion_id: cotizacion._id,
      cliente_id: cotizacion.cliente_id,
      fecha_pago: fechaPago,
      estado: 'Pendiente'
    });
    await pago.save({ session });
    pagos.push(pago._id);
  }

  // Actualizar cotización
  cotizacion.financiamiento.pagos_ids = pagos;
  cotizacion.financiamiento.fecha_inicio = fechaInicio;
  cotizacion.financiamiento.fecha_termino = new Date(fechaInicio);
  cotizacion.financiamiento.fecha_termino.setDate(fechaInicio.getDate() + (plazo_semanas * 7));

  await cotizacion.save({ session });

  // Crear estado de cuenta
  const estadoCuenta = new EstadoCuenta({
    cotizacion_id: cotizacion._id,
    cliente_id: cotizacion.cliente_id,
    saldo_inicial: cotizacion.precio_venta,
    saldo_actual: cotizacion.precio_venta - anticipo_solicitado,
    pagos_ids: pagos,
    fecha_creacion: new Date()
  });

  await estadoCuenta.save({ session });
}

// ==============================================
// Exportación
// ==============================================

module.exports = {
  // Middlewares
  verificarCotizacion: exports.verificarCotizacion,
  
  // Operaciones CRUD
  obtenerCotizaciones: exports.obtenerCotizaciones,
  obtenerCotizacionPorId: exports.obtenerCotizacionPorId,
  crearCotizacion: exports.crearCotizacion,
  actualizarCotizacion: exports.actualizarCotizacion,
  eliminarCotizacion: exports.eliminarCotizacion,
  
  // Porcentajes y cálculos
  actualizarPorcentajes: exports.actualizarPorcentajes,
  toggleCalculoAutomatico: exports.toggleCalculoAutomatico,
  
  // Mano de obra
  agregarManoObra: exports.agregarManoObra,
  actualizarManoObra: exports.actualizarManoObra,
  eliminarManoObra: exports.eliminarManoObra,
  
  // Estado
  actualizarEstado: exports.actualizarEstado,
  activarServicio: exports.activarServicio,
  completarServicio: exports.completarServicio,
  
  // Pagos
  registrarPago: exports.registrarPago,
  obtenerHistorialPagos: exports.obtenerHistorialPagos,
  
  // Catálogo
  cargarCatalogo: exports.cargarCatalogo,
  obtenerCatalogo: exports.obtenerCatalogo,
  
  // Reportes
  generarReportePDF: exports.generarReportePDF,
  generarReporteExcel: exports.generarReporteExcel
};