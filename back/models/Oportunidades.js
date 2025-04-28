const mongoose = require('mongoose');

const oportunidadSchema = new mongoose.Schema({
  cliente_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  descripcion: { type: String, required: true },
  valor_estimado: { type: Number, required: true },
  fecha_cierre_estimada: { type: Date, required: true },
  estado: { type: String, enum: ['en progreso', 'ganada', 'perdida'], default: 'en progreso' },
  responsable: { type: String, required: true },
});

module.exports = mongoose.model('Oportunidad', oportunidadSchema);