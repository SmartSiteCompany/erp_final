// src/models/Filial.js
const mongoose = require('mongoose');

const filialSchema = new mongoose.Schema({
  nombre_filial: { type: String, required: true, unique: true },
  descripcion_filial: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Filial', filialSchema);