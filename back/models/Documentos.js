// src/models/Documentos.js
const mongoose = require('mongoose');

const documentoSchema = new mongoose.Schema({
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  nombre: { type: String, required: true },
  tipo: { type: String, enum: ['contrato', 'factura', 'propuesta', 'otro'], required: true },
  fecha_subida: { type: Date, default: Date.now },
  archivo: { type: String, default: 'uploads/documents'}, // URL o referencia al archivo
  tamaño: { type: Number, required: false }, // Tamaño del archivo en bytes
  formato: { type: String, enum:['.pdf','.xls','.docs','cvs'], required: false }, // Formato del archivo (ej. PDF, DOCX)
});

module.exports = mongoose.model('Documento', documentoSchema);