// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  apellidos: { type: String, required: true },
  num_telefono: { type: String, required: false, unique: true },
  descripcion: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  email_verified_at: { type: Date, default: null },
  password: { type: String, required: true, unique: true },
  filial_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Filial', required: false
   },
  bloqueo: { type: String, default: 'activo' },
  foto_user: { type: String, default: 'uploads/users' },
  rol_user: { type: String, default: 'usuario' },
  remember_token: { type: String, default: 'uploads/tokens' },
}, { timestamps: true });

// Encriptar la contraseña antes de guardar el usuario
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para comparar contraseñas
userSchema.methods.compararPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);