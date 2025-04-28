// src/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.get('/', feedbackController.obtenerFeedbacks);
router.get('/:id', feedbackController.obtenerFeedbackPorId);
router.post('/', feedbackController.crearFeedback);
router.put('/:id', feedbackController.actualizarFeedback);
router.delete('/:id', feedbackController.eliminarFeedback);

module.exports = router;