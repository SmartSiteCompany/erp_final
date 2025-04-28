// src/controllers/estadoCuentaController.js
const mongoose = require('mongoose');
const EstadoCuenta = require('../models/EstadoCuenta');
const Pago = require('../models/Pago');
const Cotizacion = require('../models/Cotizacion');

/**
 * Obtiene todos los estados de cuenta con pagos relacionados
 */
const obtenerEstadosCuenta = async (req, res) => {
  try {
    const { cliente_id, estado } = req.query;
    const filtro = {};
    
    if (cliente_id) filtro.cliente_id = cliente_id;
    if (estado) filtro.estado = estado;

    const estados = await EstadoCuenta.find(filtro)
      .populate('cliente_id', 'nombre email telefono')
      .populate({
        path: 'cotizacion_id',
        select: 'nombre_cotizacion precio_venta estado_servicio',
        populate: {
          path: 'filial_id',
          select: 'nombre_filial direccion'
        }
      })
      .populate('pagos_ids', 'monto_pago fecha_pago metodo_pago estado tipo_pago')
      .sort({ fecha_creacion: -1 });

    res.json({ 
      success: true,
      data: estados 
    });
  } catch (error) {
    handleError(res, error, 'Error al obtener estados de cuenta');
  }
};

/**
 * Obtiene un estado de cuenta específico con detalles completos
 */
const obtenerEstadoCuentaPorId = async (req, res) => {
  try {
    const estado = await EstadoCuenta.findById(req.params.id)
      .populate('cliente_id', 'nombre email telefono direccion')
      .populate({
        path: 'cotizacion_id',
        select: 'nombre_cotizacion precio_venta forma_pago estado_servicio',
        populate: [
          { path: 'filial_id', select: 'nombre_filial direccion' },
          { path: 'vendedor', select: 'nombre' }
        ]
      })
      .populate({
        path: 'pagos_ids',
        options: { sort: { fecha_pago: -1 } }
      });

    if (!estado) {
      return res.status(404).json({ 
        success: false,
        error: 'Estado de cuenta no encontrado' 
      });
    }

    // Calcular días de mora si aplica
    if (estado.fecha_vencimiento < new Date() && estado.saldo_actual > 0) {
      const diasMora = Math.floor(
        (new Date() - estado.fecha_vencimiento) / (1000 * 60 * 60 * 24)
      );
      estado.dias_mora = diasMora;
    }

    res.json({ 
      success: true,
      data: estado 
    });
  } catch (error) {
    handleError(res, error, 'Error al obtener el estado de cuenta');
  }
};

/**
 * Obtiene el estado de cuenta asociado a una cotización específica
 */
const obtenerEstadoPorCotizacion = async (req, res) => {
  try {
    const estado = await EstadoCuenta.findOne({ 
      cotizacion_id: req.params.cotizacion_id 
    })
    .populate('cliente_id', 'nombre email')
    .populate({
      path: 'pagos_ids',
      options: { sort: { fecha_pago: -1 } }
    });

    if (!estado) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró estado de cuenta para esta cotización'
      });
    }

    // Calcular resumen de pagos
    const resumen = {
      total_pagado: estado.pagos_total,
      saldo_actual: estado.saldo_actual,
      proximo_pago: estado.pago_semanal,
      dias_mora: estado.fecha_vencimiento < new Date() ? 
        Math.floor((new Date() - estado.fecha_vencimiento) / (1000 * 60 * 60 * 24)) : 0
    };

    res.json({ 
      success: true,
      data: {
        estado,
        resumen
      }
    });
  } catch (error) {
    handleError(res, error, 'Error al obtener estado por cotización');
  }
};

/**
 * Calcula intereses moratorios para estados vencidos
 */
const calcularIntereses = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const estado = await EstadoCuenta.findById(req.params.id).session(session);
    
    if (!estado) {
      return res.status(404).json({ 
        success: false,
        error: 'Estado de cuenta no encontrado' 
      });
    }
    
    if (estado.fecha_vencimiento < new Date() && estado.saldo_actual > 0) {
      const diasMora = Math.floor(
        (new Date() - estado.fecha_vencimiento) / (1000 * 60 * 60 * 24)
      );
      
      const intereses = diasMora * (estado.saldo_actual * 0.01); // 1% diario
      
      estado.intereses_moratorios = intereses;
      estado.saldo_actual += intereses;
      estado.dias_mora = diasMora;
      
      await estado.save({ session });

      // Crear registro de pago por intereses
      const pagoIntereses = new Pago({
        cliente_id: estado.cliente_id,
        cotizacion_id: estado.cotizacion_id,
        monto_pago: intereses,
        tipo_pago: 'Intereses',
        metodo_pago: 'Sistema',
        estado: 'Pendiente',
        referencia: `INTERESES-${estado._id.toString().slice(-6)}`
      });

      await pagoIntereses.save({ session });
      estado.pagos_ids.push(pagoIntereses._id);
      await estado.save({ session });
    }

    await session.commitTransaction();
    
    res.json({ 
      success: true,
      data: estado 
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 'Error al calcular intereses');
  } finally {
    session.endSession();
  }
};

/**
 * Crea un nuevo estado de cuenta (usado automáticamente al crear cotizaciones financiadas)
 */
const crearEstadoCuenta = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validación básica
    if (!req.body.cotizacion_id || !req.body.cliente_id) {
      return res.status(400).json({
        success: false,
        error: 'Datos incompletos',
        message: 'cotizacion_id y cliente_id son requeridos'
      });
    }

    // Verificar que no exista ya un estado para esta cotización
    const existe = await EstadoCuenta.findOne({ 
      cotizacion_id: req.body.cotizacion_id 
    }).session(session);

    if (existe) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un estado de cuenta para esta cotización'
      });
    }

    const estado = new EstadoCuenta({
      ...req.body,
      estado: 'Activo',
      fecha_creacion: new Date()
    });

    await estado.save({ session });
    await session.commitTransaction();
    
    res.status(201).json({ 
      success: true,
      data: estado 
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 'Error al crear estado de cuenta');
  } finally {
    session.endSession();
  }
};

/**
 * Actualiza un estado de cuenta existente
 */
const actualizarEstadoCuenta = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const estado = await EstadoCuenta.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true,
        runValidators: true,
        session
      }
    );
    
    if (!estado) {
      return res.status(404).json({ 
        success: false,
        error: 'Estado de cuenta no encontrado' 
      });
    }

    // Recalcular saldo si se actualizan pagos
    if (req.body.pagos_ids) {
      const pagos = await Pago.find({ 
        _id: { $in: req.body.pagos_ids } 
      }).session(session);

      const totalPagado = pagos.reduce(
        (sum, pago) => sum + (pago.estado === 'Completado' ? pago.monto_pago : 0), 
        0
      );

      estado.pagos_total = totalPagado;
      estado.saldo_actual = estado.saldo_inicial - totalPagado;
      await estado.save({ session });
    }
    
    await session.commitTransaction();
    
    res.json({ 
      success: true,
      data: estado 
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 'Error al actualizar estado de cuenta');
  } finally {
    session.endSession();
  }
};

/**
 * Elimina un estado de cuenta (solo si no tiene pagos asociados)
 */
const eliminarEstadoCuenta = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const estado = await EstadoCuenta.findById(req.params.id).session(session);
    
    if (!estado) {
      return res.status(404).json({ 
        success: false,
        error: 'Estado de cuenta no encontrado' 
      });
    }
    
    // Verificar si tiene pagos asociados
    const pagosAsociados = await Pago.countDocuments({ 
      _id: { $in: estado.pagos_ids } 
    }).session(session);
    
    if (pagosAsociados > 0) {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un estado de cuenta con pagos registrados'
      });
    }
    
    await EstadoCuenta.findByIdAndDelete(req.params.id, { session });
    await session.commitTransaction();
    
    res.json({ 
      success: true,
      message: 'Estado de cuenta eliminado correctamente' 
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 'Error al eliminar estado de cuenta');
  } finally {
    session.endSession();
  }
};

/**
 * Registra un pago en el estado de cuenta
 */
const registrarPagoEstadoCuenta = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { monto, metodo_pago, tipo_pago } = req.body;
    
    if (!monto || isNaN(monto) || Number(monto) <= 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Monto debe ser un número mayor a cero' 
      });
    }

    const estado = await EstadoCuenta.findById(req.params.id).session(session);
    
    if (!estado) {
      return res.status(404).json({ 
        success: false,
        error: 'Estado de cuenta no encontrado' 
      });
    }

    // Crear el pago
    const pago = new Pago({
      cliente_id: estado.cliente_id,
      cotizacion_id: estado.cotizacion_id,
      monto_pago: monto,
      metodo_pago: metodo_pago || 'Efectivo',
      tipo_pago: tipo_pago || 'Abono',
      fecha_pago: new Date(),
      estado: 'Completado'
    });

    await pago.save({ session });

    // Actualizar estado de cuenta
    estado.pagos_ids.push(pago._id);
    estado.pagos_total += monto;
    estado.saldo_actual -= monto;

    if (estado.saldo_actual <= 0) {
      estado.estado = 'Pagado';
      estado.fecha_liquidacion = new Date();
    }

    await estado.save({ session });
    await session.commitTransaction();

    res.json({ 
      success: true,
      data: {
        estado,
        pago
      }
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 'Error al registrar pago en estado de cuenta');
  } finally {
    session.endSession();
  }
};

module.exports = {
  obtenerEstadosCuenta,
  obtenerEstadoCuentaPorId,
  obtenerEstadoPorCotizacion,
  calcularIntereses,
  crearEstadoCuenta,
  actualizarEstadoCuenta,
  eliminarEstadoCuenta,
  registrarPagoEstadoCuenta
};