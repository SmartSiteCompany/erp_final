// src/models/Campanas.js
const mongoose = require('mongoose');

const campanaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  fecha_inicio: { type: Date, required: true },
  fecha_fin: { type: Date, required: true },
  estado: { type: String, enum: ['activa', 'inactiva', 'completada'], default: 'activa' },
  clientes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' }],
});

module.exports = mongoose.model('Campana', campanaSchema);