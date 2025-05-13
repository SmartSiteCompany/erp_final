// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verificarToken = async (req, res, next) => {
  // 1. Obtener el token del header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <token>

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Token no proporcionado' 
    });
  }

  try {
    // 2. Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Verificar que el usuario exista
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }

    // 4. Adjuntar el usuario a la solicitud
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Error al verificar token:', err);
    return res.status(401).json({ 
      success: false,
      error: 'Token inválido o expirado' 
    });
  }
};

module.exports = verificarToken;