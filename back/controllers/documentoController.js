const Document = require('../models/Documentos');

// Obtener todos los documentos
const obtenerDocumentos = async (req, res) => {
  try {
    const documentos = await Document.find().populate('cliente_id');
    res.json(documentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener un documento por ID
const obtenerDocumentoPorId = async (req, res) => {
  try {
    const documento = await Document.findById(req.params.id).populate('cliente_id');
    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.json(documento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Crear un nuevo documento
const crearDocumento = async (req, res) => {
  const documento = new Document(req.body);
  try {
    await documento.save();
    res.status(201).json(documento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Actualizar un documento
const actualizarDocumento = async (req, res) => {
  try {
    const documento = await Document.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.json(documento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Eliminar un documento
const eliminarDocumento = async (req, res) => {
  try {
    const documento = await Document.findByIdAndDelete(req.params.id);
    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  obtenerDocumentos,
  obtenerDocumentoPorId,
  crearDocumento,
  actualizarDocumento,
  eliminarDocumento,
};