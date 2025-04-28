const fs = require('fs');
const path = require('path');

// Eliminar un archivo del sistema
const deleteFile = (filePath) => {
  if (!filePath) return;

  const fullPath = path.join(__dirname, '..', filePath); // Ruta absoluta

  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error('Error al eliminar el archivo:', err);
    });
  }
};

module.exports = { deleteFile };