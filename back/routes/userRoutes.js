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
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/profile', authMiddleware.verificarToken, userController.obtenerPerfil);

const multer = require('multer');

router.post('/upload-photo', authMiddleware.verificarToken, (req, res) => {
  uploadUser.single('foto_user')(req, res, async function (err) {
    console.log('Upload photo route called');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);

    if (err instanceof multer.MulterError) {
    
      return res.status(400).json({ error: `Error de Multer: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: `Error al subir archivo: ${err.message}` });
    }

    try {
      const userId = req.userId; // Obtén el ID del usuario desde el token
      const user = await User.findById(userId);

      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      if (!req.file) return res.status(400).json({ error: 'No se proporcionó archivo' });

      
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Tipo de archivo no permitido. Solo JPEG y PNG.' });
      }

      // Construir URL pública
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/users/${req.file.filename}`;
      user.foto_user = imageUrl;

      await user.save();

      res.json({
        message: 'Imagen subida correctamente',
        filePath: imageUrl
      });
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      res.status(500).json({ error: 'Error al subir la imagen' });
    }
  });
});

module.exports = router;