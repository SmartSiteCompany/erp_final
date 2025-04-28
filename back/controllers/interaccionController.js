const Interaction = require('../models/Interacciones');

// Obtener todas las interacciones
const obtenerInteracciones = async (req, res) => {
  try {
    const interacciones = await Interaction.find().populate('cliente_id');
    res.json(interacciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener una interacción por ID
const obtenerInteraccionPorId = async (req, res) => {
  try {
    const interaccion = await Interaction.findById(req.params.id).populate('cliente_id');
    if (!interaccion) {
      return res.status(404).json({ error: 'Interacción no encontrada' });
    }
    res.json(interaccion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Crear una nueva interacción
const crearInteraccion = async (req, res) => {
  const interaccion = new Interaction(req.body);
  try {
    await interaccion.save();
    res.status(201).json(interaccion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Actualizar una interacción
const actualizarInteraccion = async (req, res) => {
  try {
    const interaccion = await Interaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!interaccion) {
      return res.status(404).json({ error: 'Interacción no encontrada' });
    }
    res.json(interaccion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Eliminar una interacción
const eliminarInteraccion = async (req, res) => {
  try {
    const interaccion = await Interaction.findByIdAndDelete(req.params.id);
    if (!interaccion) {
      return res.status(404).json({ error: 'Interacción no encontrada' });
    }
    res.json({ message: 'Interacción eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  obtenerInteracciones,
  obtenerInteraccionPorId,
  crearInteraccion,
  actualizarInteraccion,
  eliminarInteraccion,
};