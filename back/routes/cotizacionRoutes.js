const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacionController');
const upload = require('../middlewares/uploadExcel');
const {
  validateCreateCotizacion,
  validateUpdateCotizacion,
  validatePorcentajes,
  validateManoObra,
  validateEstado,
  validateQueryParams,
  validatePagos
} = require('../middlewares/cotizacionValidation');
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware.verificarToken);
// ==============================================
// 1. Operaciones CRUD Básicas
// ==============================================
router.get('/', 
  validateQueryParams,
  cotizacionController.obtenerCotizaciones
);

router.get('/:id', 
  cotizacionController.verificarCotizacion,
  cotizacionController.obtenerCotizacionPorId
);

router.post('/',
  validateCreateCotizacion,
  cotizacionController.crearCotizacion
);

router.put('/:id',
  cotizacionController.verificarCotizacion,
  validateUpdateCotizacion,
  cotizacionController.actualizarCotizacion
);

router.delete('/:id',
  cotizacionController.verificarCotizacion,
  cotizacionController.eliminarCotizacion
);

// ==============================================
// 2. Gestión de Porcentajes y Cálculos
// ==============================================
router.patch('/:id/porcentajes',
  cotizacionController.verificarCotizacion,
  validatePorcentajes,
  cotizacionController.actualizarPorcentajes
);

router.patch('/:id/toggle-calculo',
  cotizacionController.verificarCotizacion,
  cotizacionController.toggleCalculoAutomatico
);

// ==============================================
// 3. Gestión de Mano de Obra
// ==============================================
router.post('/:id/mano-obra',
  cotizacionController.verificarCotizacion,
  validateManoObra,
  cotizacionController.agregarManoObra
);

router.put('/:id/mano-obra/:itemId',
  cotizacionController.verificarCotizacion,
  validateManoObra,
  cotizacionController.actualizarManoObra
);

router.delete('/:id/mano-obra/:itemId',
  cotizacionController.verificarCotizacion,
  cotizacionController.eliminarManoObra
);

// ==============================================
// 4. Operaciones de Estado
// ==============================================
router.patch('/:id/estado',
  cotizacionController.verificarCotizacion,
  validateEstado,
  cotizacionController.actualizarEstado
);

router.post('/:id/activar',
  cotizacionController.verificarCotizacion,
  cotizacionController.activarServicio
);

router.post('/:id/completar',
  cotizacionController.verificarCotizacion,
  cotizacionController.completarServicio
);

// ==============================================
// 5. Operaciones de Pagos
// ==============================================
router.post('/:id/pagos',
  cotizacionController.verificarCotizacion,
  cotizacionController.registrarPago
);

router.get('/:id/pagos',
  cotizacionController.verificarCotizacion,
  cotizacionController.obtenerHistorialPagos
);

// ==============================================
// 6. Operaciones de Catálogo (Excel)
// ==============================================
router.post('/:id/cargar-catalogo',
  cotizacionController.verificarCotizacion,
  //upload.single('catalogo'),
  cotizacionController.cargarCatalogo
);

router.get('/:id/catalogo',
  cotizacionController.verificarCotizacion,
  cotizacionController.obtenerCatalogo
);

// ==============================================
// 7. Reportes
// ==============================================
router.get('/:id/reporte-pdf',
  cotizacionController.verificarCotizacion,
  cotizacionController.generarReportePDF
);

router.get('/:id/reporte-excel',
  cotizacionController.verificarCotizacion,
  cotizacionController.generarReporteExcel
);

module.exports = router;