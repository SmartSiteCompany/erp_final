// src/routes/oportunidadRoutes.js
const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/oportunidadController');

router.get('/', opportunityController.obtenerOportunidades);
router.get('/:id', opportunityController.obtenerOportunidadPorId);
router.post('/', opportunityController.crearOportunidad);
router.put('/:id', opportunityController.actualizarOportunidad);
router.delete('/:id', opportunityController.eliminarOportunidad);

module.exports = router;