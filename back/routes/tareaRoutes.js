//src/routes/tareaRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/tareaController');

router.get('/', taskController.obtenerTareas);
router.get('/:id', taskController.obtenerTareaPorId);
router.post('/', taskController.crearTarea);
router.put('/:id', taskController.actualizarTarea);
router.delete('/:id', taskController.eliminarTarea);

module.exports = router;