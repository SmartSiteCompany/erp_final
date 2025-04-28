// src/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const { generarPDFCotizacionServicio } = require('../controllers/pdfController');

router.get('/generar-pdf/:cotizacionId/:servicioId', generarPDFCotizacionServicio);

module.exports = router;