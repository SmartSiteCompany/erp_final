// src/controllers/pagoController.js
const mongoose = require('mongoose');
const Pago = require('../models/Pago');
const Cotizacion = require('../models/Cotizacion');
const EstadoCuenta = require('../models/EstadoCuenta');
const { validateCreatePayment } = require('../middlewares/paymentValidation');
const { body, validationResult } = require('express-validator');

/**
 * Middleware de validación para registro de pagos
 */
exports.validateCreatePayment = [
  body('cotizacion_id')
    .isMongoId()
    .withMessage('ID de cotización inválido'),
  body('monto_pago')
    .isFloat({ gt: 0 })
    .withMessage('Monto debe ser numérico y mayor a 0'),
  body('metodo_pago')
    .isIn(['Efectivo', 'Transferencia', 'Tarjeta', 'Cheque'])
    .withMessage('Método de pago no válido'),
  body('tipo_pago')
    .if(body('forma_pago').exists())
    .custom((value, { req }) => {
      const formaPago = req.body.forma_pago || req.cotizacion?.forma_pago;
      if (formaPago === 'Contado' && value !== 'Contado') {
        throw new Error('Tipo de pago debe ser "Contado" para cotizaciones al contado');
      }
      if (formaPago === 'Financiado' && !['Anticipo', 'Abono', 'Intereses'].includes(value)) {
        throw new Error('Tipo de pago no válido para financiamiento');
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

/**
 * Obtiene todos los pagos con filtros
 */
const obtenerPagos = async (req, res) => {
  try {
    const { 
      cotizacion_id, 
      cliente_id, 
      tipo_pago, 
      metodo_pago, 
      fecha_inicio, 
      fecha_fin,
      estado
    } = req.query;
    
    const filtro = {};
    
    if (cotizacion_id) filtro.cotizacion_id = cotizacion_id;
    if (cliente_id) filtro.cliente_id = cliente_id;
    if (tipo_pago) filtro.tipo_pago = tipo_pago;
    if (metodo_pago) filtro.metodo_pago = metodo_pago;
    if (estado) filtro.estado = estado;
    
    if (fecha_inicio || fecha_fin) {
      filtro.fecha_pago = {};
      if (fecha_inicio) filtro.fecha_pago.$gte = new Date(fecha_inicio);
      if (fecha_fin) filtro.fecha_pago.$lte = new Date(fecha_fin);
    }

    const pagos = await Pago.find(filtro)
      .populate('cliente_id', 'nombre email telefono')
      .populate({
        path: 'cotizacion_id',
        select: 'nombre_cotizacion precio_venta estado_servicio forma_pago',
        populate: {
          path: 'filial_id',
          select: 'nombre_filial direccion'
        }
      })
      .sort({ fecha_pago: -1 });

    res.json({
      success: true,
      data: pagos
    });
  } catch (error) {
    handleError(res, error, 'Error al obtener pagos');
  }
};

/**
 * Obtiene un pago específico por ID
 */
const obtenerPagoPorId = async (req, res) => {
  try {
    const pago = await Pago.findById(req.params.id)
      .populate('cliente_id', 'nombre email telefono direccion')
      .populate({
        path: 'cotizacion_id',
        select: 'nombre_cotizacion precio_venta estado_servicio forma_pago',
        populate: [
          { path: 'filial_id', select: 'nombre_filial direccion' },
          { path: 'vendedor', select: 'nombre' }
        ]
      });

    if (!pago) {
      return res.status(404).json({
        success: false,
        error: 'Pago no encontrado'
      });
    }

    res.json({
      success: true,
      data: pago
    });
  } catch (error) {
    handleError(res, error, 'Error al obtener el pago');
  }
};

/**
 * Registra un nuevo pago
 */
const registrarPago = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cotizacion_id, monto_pago, metodo_pago, tipo_pago, observaciones } = req.body;
    
    // Obtener cotización si no viene del middleware
    const cotizacion = req.cotizacion || await Cotizacion.findById(cotizacion_id).session(session);
    
    if (!cotizacion) {
      throw new Error('Cotización no encontrada');
    }

    // Validar monto para financiamiento
    if (cotizacion.forma_pago === 'Financiado') {
      const saldoPendiente = cotizacion.financiamiento.saldo_restante;
      if (monto_pago > saldoPendiente && tipo_pago === 'Abono') {
        throw new Error(`El monto excede el saldo pendiente ($${saldoPendiente})`);
      }
    }

    // Crear referencia única
    const referencia = `${tipo_pago.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;

    const pago = new Pago({
      cliente_id: cotizacion.cliente_id,
      cotizacion_id,
      monto_pago,
      metodo_pago,
      tipo_pago: tipo_pago || (cotizacion.forma_pago === 'Contado' ? 'Contado' : 'Abono'),
      fecha_pago: new Date(),
      estado: 'Completado',
      referencia,
      observaciones
    });

    await pago.save({ session });

    // Actualizar cotización según tipo de pago
    if (pago.tipo_pago === 'Contado') {
      await Cotizacion.findByIdAndUpdate(
        cotizacion_id,
        { 
          pago_contado_id: pago._id,
          estado_servicio: 'Completado'
        },
        { session }
      );
    } else if (cotizacion.forma_pago === 'Financiado') {
      // Actualizar saldo en cotización
      cotizacion.financiamiento.saldo_restante -= monto_pago;
      
      if (cotizacion.financiamiento.saldo_restante <= 0) {
        cotizacion.estado_servicio = 'Completado';
      }
      
      await cotizacion.save({ session });

      // Actualizar estado de cuenta
      await EstadoCuenta.findOneAndUpdate(
        { cotizacion_id },
        {
          $push: { pagos_ids: pago._id },
          $inc: { 
            pagos_total: monto_pago,
            saldo_actual: -monto_pago
          }
        },
        { session }
      );
    }

    await session.commitTransaction();

    const pagoRegistrado = await Pago.findById(pago._id)
      .populate('cliente_id', 'nombre email')
      .populate('cotizacion_id', 'nombre_cotizacion');

    res.status(201).json({
      success: true,
      message: 'Pago registrado exitosamente',
      data: pagoRegistrado
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 'Error al registrar el pago');
  } finally {
    session.endSession();
  }
};

/**
 * Actualiza un pago existente
 */
const actualizarPago = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { monto_pago, metodo_pago, observaciones, estado } = req.body;
    
    const pago = await Pago.findById(req.params.id).session(session);
    
    if (!pago) {
      return res.status(404).json({
        success: false,
        error: 'Pago no encontrado'
      });
    }

    // Validar que no sea pago de contado
    if (pago.tipo_pago === 'Contado') {
      return res.status(400).json({
        success: false,
        error: 'No se puede modificar un pago de contado'
      });
    }

    // Calcular diferencia de monto si cambió
    const diferenciaMonto = monto_pago ? monto_pago - pago.monto_pago : 0;

    const pagoActualizado = await Pago.findByIdAndUpdate(
      req.params.id,
      {
        monto_pago,
        metodo_pago,
        observaciones,
        estado,
        ...(estado === 'Completado' && { fecha_pago: new Date() })
      },
      { new: true, session }
    );

    // Actualizar saldos si el monto cambió
    if (diferenciaMonto !== 0) {
      const cotizacion = await Cotizacion.findById(pago.cotizacion_id).session(session);
      
      if (cotizacion.forma_pago === 'Financiado') {
        cotizacion.financiamiento.saldo_restante -= diferenciaMonto;
        await cotizacion.save({ session });
      }

      // Actualizar estado de cuenta
      await EstadoCuenta.findOneAndUpdate(
        { cotizacion_id: pago.cotizacion_id },
        { $inc: { 
          pagos_total: diferenciaMonto,
          saldo_actual: -diferenciaMonto
        }},
        { session }
      );
    }

    await session.commitTransaction();

    res.json({
      success: true,
      data: pagoActualizado
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 'Error al actualizar el pago');
  } finally {
    session.endSession();
  }
};

/**
 * Elimina un pago (solo si no es de contado)
 */
const eliminarPago = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const pago = await Pago.findById(req.params.id).session(session);
    
    if (!pago) {
      return res.status(404).json({
        success: false,
        error: 'Pago no encontrado'
      });
    }

    if (pago.tipo_pago === 'Contado') {
      return res.status(400).json({
        success: false,
        error: 'No se puede eliminar un pago de contado'
      });
    }

    // Verificar si el pago está completado
    if (pago.estado === 'Completado') {
      const cotizacion = await Cotizacion.findById(pago.cotizacion_id).session(session);
      
      // Revertir saldo en cotización
      if (cotizacion.forma_pago === 'Financiado') {
        cotizacion.financiamiento.saldo_restante += pago.monto_pago;
        await cotizacion.save({ session });
      }

      // Revertir en estado de cuenta
      await EstadoCuenta.findOneAndUpdate(
        { cotizacion_id: pago.cotizacion_id },
        { 
          $pull: { pagos_ids: pago._id },
          $inc: { 
            pagos_total: -pago.monto_pago,
            saldo_actual: pago.monto_pago
          }
        },
        { session }
      );
    }

    await Pago.findByIdAndDelete(req.params.id, { session });
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Pago eliminado correctamente'
    });
  } catch (error) {
    await session.abortTransaction();
    handleError(res, error, 'Error al eliminar el pago');
  } finally {
    session.endSession();
  }
};

/**
 * Obtiene pagos por cotización
 */
const obtenerPagosPorCotizacion = async (req, res) => {
  try {
    const pagos = await Pago.find({ cotizacion_id: req.params.cotizacion_id })
      .sort({ fecha_pago: -1 });

    if (!pagos || pagos.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron pagos para esta cotización'
      });
    }

    res.json({
      success: true,
      data: pagos
    });
  } catch (error) {
    handleError(res, error, 'Error al obtener pagos por cotización');
  }
};

module.exports = {
  validateCreatePayment,
  obtenerPagos,
  obtenerPagoPorId,
  registrarPago,
  actualizarPago,
  eliminarPago,
  obtenerPagosPorCotizacion
};