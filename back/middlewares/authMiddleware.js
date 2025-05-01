const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verificarToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7, authHeader.length).trim() : authHeader;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Decoded token for ${req.method} ${req.path}:`, decoded);
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(400).json({ error: 'Token inválido.' });
  }
};
