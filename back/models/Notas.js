// src/models/Notas.js
const mongoose = require('mongoose');

const notaSchema = new mongoose.Schema({
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: false },
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: false },
  titulo: { type: String, required: true },
  contenido: { type: String, required: true },
  fecha_creacion: { type: Date, default: Date.now },
  autor: { type: String, required: true },
});

module.exports = mongoose.model('Nota', notaSchema);