// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.post('/solicitar-restablecimiento', authController.solicitarRestablecimiento);
router.post('/restablecer-contraseña', authController.restablecerContraseña);
router.get('/perfil', authMiddleware.verificarToken, userController.obtenerPerfil);

module.exports = router;