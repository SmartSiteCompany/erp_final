// src/models/Cliente.js
const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true},
  telefono: { type: String, required: false , unique: true },
  correo: { type: String,required: true, unique: true },
  direccion: { type: String, required: true },
  fecha_registro: { type: Date, default: Date.now },
  estado_cliente: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
  tipo_cliente: { type: String, enum: ['Individual', 'Empresa'], required: true },
});

module.exports = mongoose.model('Cliente', clienteSchema);