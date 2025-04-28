// src/routes/pagoRoutes.js
const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');

// Middlewares
const { validateCreatePayment } = pagoController;
const { verificarCotizacion } = require('../controllers/cotizacionController');
// ==============================================
// Rutas CRUD para Pagos
// ==============================================
router.get('/', pagoController.obtenerPagos);
router.get('/:id', pagoController.obtenerPagoPorId);
router.post('/', validateCreatePayment, pagoController.registrarPago);
router.put('/:id', pagoController.actualizarPago);
router.delete('/:id', pagoController.eliminarPago);

// ==============================================
// Rutas Específicas para Financiamiento
// ==============================================

router.get('/cotizacion/:cotizacion_id', verificarCotizacion, pagoController.obtenerPagosPorCotizacion);

module.exports = router;