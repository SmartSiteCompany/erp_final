// src/routes/interaccionRoutes.js
const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interaccionController');

router.get('/', interactionController.obtenerInteracciones);
router.get('/:id', interactionController.obtenerInteraccionPorId);
router.post('/', interactionController.crearInteraccion);
router.put('/:id', interactionController.actualizarInteraccion);
router.delete('/:id', interactionController.eliminarInteraccion);

module.exports = router;