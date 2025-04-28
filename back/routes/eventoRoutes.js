//src/routes/eventoRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventoController');

router.get('/', eventController.obtenerEventos);
router.get('/:id', eventController.obtenerEventoPorId);
router.post('/', eventController.crearEvento);
router.put('/:id', eventController.actualizarEvento);
router.delete('/:id', eventController.eliminarEvento);

module.exports = router;