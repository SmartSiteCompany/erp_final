// src/routes/passwordResetRoutes.js
const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

router.post('/', passwordResetController.crearPasswordReset);
router.get('/:token', passwordResetController.obtenerPasswordResetPorToken);
router.delete('/:token', passwordResetController.eliminarPasswordReset);

module.exports = router;