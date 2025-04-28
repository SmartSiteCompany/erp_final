// src/routes/notaRoutes.js
const express = require('express');
const router = express.Router();
const noteController = require('../controllers/notaController');

router.get('/', noteController.obtenerNotas);
router.get('/:id', noteController.obtenerNotaPorId);
router.post('/', noteController.crearNota);
router.put('/:id', noteController.actualizarNota);
router.delete('/:id', noteController.eliminarNota);

module.exports = router;