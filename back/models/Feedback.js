// src/models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  comentario: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  calificacion: { type: Number, min: 1, max: 5, required: true },
});

module.exports = mongoose.model('Feedback', feedbackSchema);