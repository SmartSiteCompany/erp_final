// src/models/Catalogo.js
const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true }, // Columna B "Codigo Smart"
  nombre: { type: String, required: true }, // Columna C "Descripción"
  codigoTienda: { type: String }, // Columna D
  categoria: { type: String, required: true }, // Columna E
  subcategoria: { type: String }, // Columna F
  precioCompra: { type: Number }, // Columna G
  precioSinFinanciamiento: { type: Number }, // Columna H
  precioConFinanciamiento: { type: Number }, // Columna I
  seccion: { type: String }, // Columna J
  estatus: { 
    type: String, 
    enum: ['Activo', 'Inactivo'], 
    default: 'Activo' 
  }, // Columna K
  fechaCreacion: { type: Date, default: Date.now }, // Columna L
  fechaModificacion: { type: Date, default: Date.now } // Columna M
});

// Actualizar fechaModificacion antes de guardar
productoSchema.pre('save', function(next) {
  this.fechaModificacion = Date.now();
  next();
});

module.exports = mongoose.model('Catalogo', productoSchema);