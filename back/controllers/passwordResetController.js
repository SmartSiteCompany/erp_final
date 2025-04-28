const PasswordReset = require('../models/PasswordReset');

// Crear un registro de restablecimiento de contraseña
const crearPasswordReset = async (req, res) => {
  const passwordReset = new PasswordReset(req.body);
  try {
    await passwordReset.save();
    res.status(201).json(passwordReset);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener un registro de restablecimiento de contraseña por token
const obtenerPasswordResetPorToken = async (req, res) => {
  try {
    const passwordReset = await PasswordReset.findOne({ token: req.params.token });
    if (!passwordReset) {
      return res.status(404).json({ error: 'Token no encontrado' });
    }
    res.json(passwordReset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un registro de restablecimiento de contraseña
const eliminarPasswordReset = async (req, res) => {
  try {
    await PasswordReset.deleteOne({ token: req.params.token });
    res.json({ message: 'Registro de restablecimiento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearPasswordReset,
  obtenerPasswordResetPorToken,
  eliminarPasswordReset,
};