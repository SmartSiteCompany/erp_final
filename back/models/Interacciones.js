// src/models/Interacciones.js
const mongoose = require('mongoose');

const interaccionSchema = new mongoose.Schema({
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  tipo_interaccion: { type: String, enum: ['llamada', 'correo', 'reunión', 'visita'], required: true },
  fecha: { type: Date, default: Date.now },
  descripcion: { type: String, required: true },
  responsable: { type: String, required: true },
  estado: { type: String, enum: ['pendiente', 'completada', 'cancelada'], default: 'pendiente' },
});

module.exports = mongoose.model('Interaccion', interaccionSchema);