// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verificarToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Token inválido',
      details: error.message 
    });
  }
};

exports.verificarToken = verificarToken;