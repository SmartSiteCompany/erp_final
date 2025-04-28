const { body, param, query } = require('express-validator');
const { 
  estadosCotizacion, 
  formasPago,
  estadosServicio,
  configFinanciera
} = require('../utils/constantes');

// ==============================================
// Validación para Creación de Cotización
// ==============================================
exports.validateCreateCotizacion = [
  body('nombre_cotizacion')
    .notEmpty().withMessage('El nombre es requerido')
    .trim()
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),

  body('cliente_id')
    .isMongoId().withMessage('ID de cliente inválido'),

  body('filial_id')
    .isMongoId().withMessage('ID de filial inválido'),

  body('forma_pago')
    .isIn(formasPago).withMessage('Forma de pago no válida'),

  body('detalles')
    .isArray({ min: 1 }).withMessage('Debe incluir al menos un ítem'),

  body('detalles.*.tipo')
    .optional()
    .isIn(['Producto', 'Servicio', 'ManoObra']).withMessage('Tipo de ítem no válido'),

  body('detalles.*.producto_id')
    .if(body('detalles.*.tipo').not().equals('ManoObra'))
    .isMongoId().withMessage('ID de producto/servicio inválido'),

  body('detalles.*.horas')
    .if(body('detalles.*.tipo').equals('ManoObra'))
    .isFloat({ gt: 0 }).withMessage('Las horas deben ser mayores a 0'),

  body('detalles.*.tarifa_hora')
    .if(body('detalles.*.tipo').equals('ManoObra'))
    .isFloat({ gt: 0 }).withMessage('La tarifa por hora debe ser mayor a 0'),

  body('detalles.*.cantidad')
    .isInt({ gt: 0 }).withMessage('La cantidad mínima es 1'),

  body('detalles.*.utilidad_esperada')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('La utilidad debe estar entre 0% y 100%'),

  body('porcentajes.iva')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('El IVA debe estar entre 0% y 100%'),

  body('porcentajes.financiamiento')
    .optional()
    .isFloat({ min: 0 }).withMessage('La tasa de financiamiento no puede ser negativa'),

  body('porcentajes.agregado')
    .optional()
    .isFloat({ min: 0 }).withMessage('El porcentaje agregado no puede ser negativo'),

  body('calculos_automaticos')
    .optional()
    .isBoolean().withMessage('Debe ser verdadero o falso')
];

// ==============================================
// Validación para Actualización de Cotización
// ==============================================
exports.validateUpdateCotizacion = [
  param('id')
    .isMongoId().withMessage('ID de cotización inválido'),

  body('subtotal')
    .optional()
    .isFloat({ min: 0 }).withMessage('El subtotal no puede ser negativo'),

  body('iva')
    .optional()
    .isFloat({ min: 0 }).withMessage('El IVA no puede ser negativo'),

  body('precio_venta')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio total no puede ser negativo'),

  body('detalles.*._id')
    .optional()
    .isMongoId().withMessage('ID de detalle inválido'),

  body('detalles.*.precio_venta')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio del ítem no puede ser negativo'),

  ...this.validateCreateCotizacion.filter(v => v.field !== 'forma_pago')
];

// ==============================================
// Validación para Porcentajes
// ==============================================
exports.validatePorcentajes = [
  param('id')
    .isMongoId().withMessage('ID de cotización inválido'),

  body('iva')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('El IVA debe estar entre 0% y 100%'),

  body('financiamiento')
    .optional()
    .isFloat({ min: 0 }).withMessage('La tasa de financiamiento no puede ser negativa'),

  body('agregado')
    .optional()
    .isFloat({ min: 0 }).withMessage('El porcentaje agregado no puede ser negativo')
];

// ==============================================
// Validación para Mano de Obra
// ==============================================
exports.validateManoObra = [
  param('id')
    .isMongoId().withMessage('ID de cotización inválido'),

  param('itemId')
    .optional()
    .isMongoId().withMessage('ID de ítem inválido'),

  body('horas')
    .isFloat({ gt: 0 }).withMessage('Las horas deben ser mayores a 0'),

  body('tarifa_hora')
    .isFloat({ gt: 0 }).withMessage('La tarifa por hora debe ser mayor a 0'),

  body('descripcion')
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ max: 200 }).withMessage('Máximo 200 caracteres'),

  body('utilidad_esperada')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('La utilidad debe estar entre 0% y 100%')
];

// ==============================================
// Validación para Cambio de Estado
// ==============================================
exports.validateEstado = [
  param('id')
    .isMongoId().withMessage('ID de cotización inválido'),

  body('estado')
    .isIn(estadosCotizacion).withMessage('Estado no válido'),

  body('estado_servicio')
    .optional()
    .isIn(estadosServicio).withMessage('Estado de servicio no válido')
];

// ==============================================
// Validación para Búsqueda/Filtrado
// ==============================================
exports.validateQueryParams = [
  query('estado')
    .optional()
    .isIn(estadosCotizacion).withMessage('Estado no válido'),

  query('estado_servicio')
    .optional()
    .isIn(estadosServicio).withMessage('Estado de servicio no válido'),

  query('forma_pago')
    .optional()
    .isIn(formasPago).withMessage('Forma de pago no válida'),

  query('calculos_automaticos')
    .optional()
    .isBoolean().withMessage('Debe ser true o false')
];