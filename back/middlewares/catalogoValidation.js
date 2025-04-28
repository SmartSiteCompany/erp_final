const { body, param, query } = require('express-validator');
const { tiposCategoria, estadosProducto } = require('../utils/constantes');

// ==============================================
// Validación para Creación de Productos/Servicios
// ==============================================
exports.validateCreateProduct = [
  body('codigo')
    .notEmpty().withMessage('El código Smart es requerido')
    .isString().withMessage('El código debe ser texto')
    .trim()
    .isLength({ max: 20 }).withMessage('Máximo 20 caracteres')
    .matches(/^[A-Z0-9-]+$/).withMessage('Solo mayúsculas, números y guiones'),

  body('nombre')
    .notEmpty().withMessage('La descripción es requerida')
    .isString().withMessage('El nombre debe ser texto')
    .trim()
    .isLength({ max: 200 }).withMessage('Máximo 200 caracteres'),

  body('codigoTienda')
    .optional()
    .isString().withMessage('Debe ser texto')
    .trim()
    .isLength({ max: 30 }).withMessage('Máximo 30 caracteres'),

  body('categoria')
    .notEmpty().withMessage('La categoría es requerida')
    .isIn(tiposCategoria).withMessage('Categoría no válida'),

  body('subcategoria')
    .optional()
    .isString().withMessage('Debe ser texto')
    .trim()
    .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),

  body('precioCompra')
    .optional()
    .isFloat({ min: 0 }).withMessage('Debe ser número positivo')
    .toFloat(),

  body('precioSinFinanciamiento')
    .notEmpty().withMessage('Precio sin financiamiento es requerido')
    .isFloat({ min: 0 }).withMessage('Debe ser número positivo')
    .toFloat(),

  body('precioConFinanciamiento')
    .notEmpty().withMessage('Precio con financiamiento es requerido')
    .isFloat({ min: 0 }).withMessage('Debe ser número positivo')
    .toFloat(),

  body('seccion')
    .optional()
    .isString().withMessage('Debe ser texto')
    .trim()
    .isLength({ max: 30 }).withMessage('Máximo 30 caracteres'),

  body('estatus')
    .optional()
    .isIn(estadosProducto).withMessage('Estatus no válido')
    .default('Activo')
];

// ==============================================
// Validación para Actualización de Productos
// ==============================================
exports.validateUpdateProduct = [
  param('codigo')
    .notEmpty().withMessage('El código del producto es requerido')
    .isString().withMessage('El código debe ser texto'),

  body('nombre')
    .optional()
    .isString().withMessage('La descripción debe ser texto')
    .trim()
    .isLength({ max: 200 }).withMessage('Máximo 200 caracteres'),

  body('precioSinFinanciamiento')
    .optional()
    .isFloat({ min: 0 }).withMessage('Debe ser número positivo')
    .toFloat(),

  body('precioConFinanciamiento')
    .optional()
    .isFloat({ min: 0 }).withMessage('Debe ser número positivo')
    .toFloat(),

  body('estatus')
    .optional()
    .isIn(estadosProducto).withMessage('Estatus no válido')
];

// ==============================================
// Validación para Consultas/Búsquedas
// ==============================================
exports.validateProductQuery = [
  query('categoria')
    .optional()
    .isIn(tiposCategoria).withMessage('Categoría no válida'),

  query('subcategoria')
    .optional()
    .isString().withMessage('Debe ser texto')
    .trim(),

  query('estatus')
    .optional()
    .isIn(estadosProducto).withMessage('Estatus no válido'),

  query('precio_min')
    .optional()
    .isFloat({ min: 0 }).withMessage('Debe ser número positivo')
    .toFloat(),

  query('precio_max')
    .optional()
    .isFloat({ min: 0 }).withMessage('Debe ser número positivo')
    .toFloat(),

  query('termino')
    .optional()
    .isString().withMessage('Debe ser texto')
    .trim()
    .isLength({ max: 50 }).withMessage('Máximo 50 caracteres'),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Debe ser entero mayor a 0')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Debe ser entre 1 y 100')
    .toInt()
];

// ==============================================
// Validación para Items de Cotización
// ==============================================
exports.validateCotizacionItem = [
  body('producto')
    .notEmpty().withMessage('El ID del producto es requerido')
    .isMongoId().withMessage('ID no válido'),

  body('cantidad')
    .notEmpty().withMessage('La cantidad es requerida')
    .isInt({ min: 1 }).withMessage('Debe ser entero mayor a 0')
    .toInt(),

  body('descuento')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Debe ser entre 0 y 100')
    .toFloat()
];

// ==============================================
// Validación para Búsqueda en Cotizaciones
// ==============================================
exports.validateBusquedaCotizacion = [
  query('termino')
    .notEmpty().withMessage('Término de búsqueda requerido')
    .isString().withMessage('Debe ser texto')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Entre 3 y 50 caracteres')
];