const Segmentation = require('../models/Segmentacion');

// Obtener todas las segmentaciones
const obtenerSegmentaciones = async (req, res) => {
  try {
    const segmentaciones = await Segmentation.find().populate('clientes');
    res.json(segmentaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener una segmentación por ID
const obtenerSegmentacionPorId = async (req, res) => {
  try {
    const segmentacion = await Segmentation.findById(req.params.id).populate('clientes');
    if (!segmentacion) {
      return res.status(404).json({ error: 'Segmentación no encontrada' });
    }
    res.json(segmentacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Crear una nueva segmentación
const crearSegmentacion = async (req, res) => {
  const segmentacion = new Segmentation(req.body);
  try {
    await segmentacion.save();
    res.status(201).json(segmentacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Actualizar una segmentación
const actualizarSegmentacion = async (req, res) => {
  try {
    const segmentacion = await Segmentation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!segmentacion) {
      return res.status(404).json({ error: 'Segmentación no encontrada' });
    }
    res.json(segmentacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Eliminar una segmentación
const eliminarSegmentacion = async (req, res) => {
  try {
    const segmentacion = await Segmentation.findByIdAndDelete(req.params.id);
    if (!segmentacion) {
      return res.status(404).json({ error: 'Segmentación no encontrada' });
    }
    res.json({ message: 'Segmentación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  obtenerSegmentaciones,
  obtenerSegmentacionPorId,
  crearSegmentacion,
  actualizarSegmentacion,
  eliminarSegmentacion,
};  