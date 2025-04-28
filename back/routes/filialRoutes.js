// src/routes/filialRoutes.js
const express = require('express');
const router = express.Router();
const filialController = require('../controllers/filialController');

router.get('/', filialController.obtenerFiliales);
router.get('/:id', filialController.obtenerFilialPorId);
router.post('/', filialController.crearFilial);
router.put('/:id', filialController.actualizarFilial);
router.delete('/:id', filialController.eliminarFilial);

module.exports = router;