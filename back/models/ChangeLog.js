// src/models/ChangeLog.js
const mongoose = require('mongoose');

const changeLogSchema = new mongoose.Schema({
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  campo_modificado: { type: String, required: true },
  valor_anterior: { type: String, required: true },
  valor_nuevo: { type: String, required: true },
  fecha_cambio: { type: Date, default: Date.now },
  responsable: { type: String, required: true },
});

module.exports = mongoose.model('ChangeLog', changeLogSchema);