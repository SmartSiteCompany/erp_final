// catalogoRoutes.js
const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogoController');
const uploadExcel = require('../middlewares/uploadExcel');
const catalogoValidation = require('../middlewares/catalogoValidation');

// CRUD
router.post(
  '/',
  catalogoValidation.validateCreateProduct,
  catalogoController.crearProducto
);

router.get('/', catalogoController.obtenerCatalogo);

// Después (solución):
router.get('/:id', catalogoController.buscarPorId); //

//router.get('/codigo/:codigo', catalogoController.verificarProducto, catalogoController.buscarPorCodigo); // /catalogos/codigo/COD123

router.put(
  '/:codigo',
  catalogoValidation.validateUpdateProduct,
  catalogoController.actualizarProducto
);

// Carga masiva
router.post(
  '/cargar-excel',
  uploadExcel.singleUpload,
  uploadExcel.validateExcelStructure,
  catalogoController.cargarCatalogo
);

// Filtros
router.get(
  '/categoria/:categoria',
  catalogoController.obtenerPorCategoria
);

module.exports = router;