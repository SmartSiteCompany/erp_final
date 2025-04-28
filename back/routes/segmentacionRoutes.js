//src/routes/segmentacionRoutes.js
const express = require('express');
const router = express.Router();
const segmentationController = require('../controllers/segmentacionController');

router.get('/', segmentationController.obtenerSegmentaciones);
router.get('/:id', segmentationController.obtenerSegmentacionPorId);
router.post('/', segmentationController.crearSegmentacion);
router.put('/:id', segmentationController.actualizarSegmentacion);
router.delete('/:id', segmentationController.eliminarSegmentacion);

module.exports = router;