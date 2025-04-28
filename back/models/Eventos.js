// src/models/Eventos.js
const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  fecha: { type: Date, required: true },
  ubicacion: { type: String, required: true },
  clientes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' }],
});

module.exports = mongoose.model('Evento', eventoSchema);