const User = require('../models/User');
const transporter = require('../config/nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const registro = async (req, res) => {
  const { name, apellidos, email, password, area } = req.body;

  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Crear el nuevo usuario
    const usuario = new User({ name, apellidos, email, password, area });
    await usuario.save();

    // Generar el token JWT
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Verificar si el usuario existe
      const usuario = await User.findOne({ email });
      if (!usuario) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }
  
      // Comparar contraseñas
      const contraseñaValida = await usuario.compararPassword(password);
      if (!contraseñaValida) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }
  
      // Generar el token JWT
      const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
  
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const solicitarRestablecimiento = async (req, res) => {
    const { email } = req.body;
  
    try {
      // Verificar si el usuario existe
      const usuario = await User.findOne({ email });
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      // Generar un token único
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Guardar el token en la base de datos
      await PasswordReset.create({ email, token });
  
      // Enviar correo electrónico con el enlace de restablecimiento
      const resetLink = `http://localhost:3000/reset-password?token=${token}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Restablecimiento de Contraseña',
        html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
               <a href="${resetLink}">${resetLink}</a>`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.json({ message: 'Correo de restablecimiento enviado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const restablecerContraseña = async (req, res) => {
    const { token, newPassword } = req.body;
  
    try {
      // Verificar si el token es válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { email } = decoded;
  
      // Buscar el registro de restablecimiento
      const passwordReset = await PasswordReset.findOne({ email, token });
      if (!passwordReset) {
        return res.status(400).json({ error: 'Token inválido o expirado' });
      }
  
      // Buscar al usuario y actualizar su contraseña
      const usuario = await User.findOne({ email });
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      usuario.password = newPassword;
      await usuario.save();
  
      // Eliminar el registro de restablecimiento
      await PasswordReset.deleteOne({ email, token });
  
      res.json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  module.exports = {
    registro,
    login,
    solicitarRestablecimiento,
    restablecerContraseña,
  };