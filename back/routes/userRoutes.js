// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const User = require('../models/User');
const { uploadUser } = require('../middlewares/upload');


router.get('/', userController.obtenerUsuarios);
router.get('/:id', userController.obtenerUsuarioPorId);
router.post('/', userController.crearUsuario);
router.put('/:id', userController.actualizarUsuario);
router.delete('/:id', userController.eliminarUsuario);  
// Subir/actualizar foto de perfil
router.post('/upload-photo', uploadUser.single('foto_user'), async (req, res) => {
    try {
      const userId = req.body.userId; // Obtén el ID del usuario (puede venir de JWT)
      const user = await User.findById(userId);
     
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
          // Construir URL pública
          const imageUrl = `${req.protocol}://${req.get('host')}/uploads/users/${req.file.filename}`;
          user.foto_user = imageUrl;
  
          await user.save();
  
          res.json({ 
              message: 'Imagen subida correctamente',
              filePath: imageUrl 
          });
      } catch (error) {
          res.status(500).json({ error: 'Error al subir la imagen' });
      }
  })

module.exports = router;