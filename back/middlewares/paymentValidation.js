// src/middlewares/paymentValidation.js
const { body, param, query, validationResult } = require('express-validator');
const Cotizacion = require('../models/Cotizacion');
const { tiposPago, metodosPago } = require('../utils/constantes');

/**
 * Validaciones para registro de pagos
 */
exports.validateCreatePayment = [
  // Validación de campos básicos
  body('cotizacion_id')
    .notEmpty().withMessage('El ID de cotización es requerido')
    .isMongoId().withMessage('ID de cotización inválido')
    .custom(async (value, { req }) => {
      const cotizacion = await Cotizacion.findById(value);
      if (!cotizacion) {
        throw new Error('Cotización no encontrada');
      }
      req.cotizacion = cotizacion; // Inyectamos la cotización en el request
      return true;
    }),

  body('monto_pago')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ gt: 0 }).withMessage('El monto debe ser un número positivo')
    .custom((value, { req }) => {
      if (req.cotizacion?.forma_pago === 'Financiado') {
        const saldoPendiente = req.cotizacion.financiamiento.saldo_restante;
        if (value > saldoPendiente) {
          throw new Error(`El monto excede el saldo pendiente ($${saldoPendiente})`);
        }
      }
      return true;
    }),

  body('metodo_pago')
    .notEmpty().withMessage('El método de pago es requerido')
    .isIn(metodosPago).withMessage(`Método de pago no válido. Opciones: ${metodosPago.join(', ')}`),

  body('tipo_pago')
    .notEmpty().withMessage('El tipo de pago es requerido')
    .isIn(tiposPago).withMessage(`Tipo de pago no válido. Opciones: ${tiposPago.join(', ')}`)
    .custom((value, { req }) => {
      const formaPago = req.cotizacion?.forma_pago;
      
      if (formaPago === 'Contado' && value !== 'Contado') {
        throw new Error('Para cotizaciones al contado el tipo debe ser "Contado"');
      }
      
      if (formaPago === 'Financiado' && value === 'Contado') {
        throw new Error('Para financiamiento no se permiten pagos de tipo "Contado"');
      }
      
      return true;
    }),

  body('observaciones')
    .optional()
    .isString().withMessage('Las observaciones deben ser texto')
    .isLength({ max: 500 }).withMessage('Las observaciones no pueden exceder los 500 caracteres'),

  // Manejo de resultados de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        details: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

/**
 * Validaciones para actualización de pagos
 */
exports.validateUpdatePayment = [
  param('id')
    .isMongoId().withMessage('ID de pago inválido'),

  body('monto_pago')
    .optional()
    .isFloat({ gt: 0 }).withMessage('El monto debe ser un número positivo'),

  body('metodo_pago')
    .optional()
    .isIn(metodosPago).withMessage(`Método de pago no válido. Opciones: ${metodosPago.join(', ')}`),

  body('estado')
    .optional()
    .isIn(['Pendiente', 'Completado', 'Cancelado']).withMessage('Estado no válido'),

  body('observaciones')
    .optional()
    .isString().withMessage('Las observaciones deben ser texto')
    .isLength({ max: 500 }).withMessage('Las observaciones no pueden exceder los 500 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * Validaciones para consulta de pagos
 */
exports.validateQueryPayments = [
  query('cotizacion_id')
    .optional()
    .isMongoId().withMessage('ID de cotización inválido'),

  query('cliente_id')
    .optional()
    .isMongoId().withMessage('ID de cliente inválido'),

  query('tipo_pago')
    .optional()
    .isIn(tiposPago).withMessage(`Tipo de pago no válido. Opciones: ${tiposPago.join(', ')}`),

  query('metodo_pago')
    .optional()
    .isIn(metodosPago).withMessage(`Método de pago no válido. Opciones: ${metodosPago.join(', ')}`),

  query('estado')
    .optional()
    .isIn(['Pendiente', 'Completado', 'Cancelado']).withMessage('Estado no válido'),

  query('fecha_inicio')
    .optional()
    .isISO8601().withMessage('Formato de fecha inválido (usar ISO8601)'),

  query('fecha_fin')
    .optional()
    .isISO8601().withMessage('Formato de fecha inválido (usar ISO8601)')
    .custom((value, { req }) => {
      if (req.query.fecha_inicio && new Date(value) < new Date(req.query.fecha_inicio)) {
        throw new Error('La fecha final debe ser posterior a la fecha inicial');
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        details: errors.array()
      });
    }
    next();
  }
];

/**
 * Validaciones para eliminación de pagos
 */
exports.validateDeletePayment = [
  param('id')
    .isMongoId().withMessage('ID de pago inválido')
    .custom(async (value, { req }) => {
      const pago = await Pago.findById(value);
      if (!pago) {
        throw new Error('Pago no encontrado');
      }
      if (pago.tipo_pago === 'Contado') {
        throw new Error('No se pueden eliminar pagos de contado');
      }
      if (pago.estado === 'Completado') {
        const cotizacion = await Cotizacion.findOne({ _id: pago.cotizacion_id });
        if (cotizacion.estado_servicio === 'Completado') {
          throw new Error('No se pueden eliminar pagos de servicios completados');
        }
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        details: errors.array()
      });
    }
    next();
  }
];

