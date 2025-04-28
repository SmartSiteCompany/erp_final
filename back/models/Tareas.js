// src/models/Tarea.js
const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema({
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: false},
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  filial_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Filial', required: true },
  descripcion: { type: String, required: true },
  fecha_creacion: { type: Date, default: Date.now, required: true },
  fecha_vencimiento: { type: Date, default: Date.now, required: true },
  estado: { type: String, enum: ['pendiente', 'en progreso', 'completada'], default: 'pendiente' }
});

module.exports = mongoose.model('Tarea', tareaSchema);