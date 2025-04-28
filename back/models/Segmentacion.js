// src/models/Segmentacion.js
const mongoose = require('mongoose');

const segmentacionSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  criterios: { type: String, required: true }, // Ejemplo: "tipo_cliente: Empresa"
  clientes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' }],
});

module.exports = mongoose.model('Segmentacion', segmentacionSchema);