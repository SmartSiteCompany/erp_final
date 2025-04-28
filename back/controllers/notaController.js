const Note = require('../models/Notas');

// Obtener todas las notas
const obtenerNotas = async (req, res) => {
  try {
    const notas = await Note.find().populate('cliente_id');
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener una nota por ID
const obtenerNotaPorId = async (req, res) => {
  try {
    const nota = await Note.findById(req.params.id).populate('cliente_id');
    if (!nota) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    res.json(nota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Crear una nueva nota
const crearNota = async (req, res) => {
  const nota = new Note(req.body);
  try {
    await nota.save();
    res.status(201).json(nota);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Actualizar una nota
const actualizarNota = async (req, res) => {
  try {
    const nota = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!nota) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    res.json(nota);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Eliminar una nota
const eliminarNota = async (req, res) => {
  try {
    const nota = await Note.findByIdAndDelete(req.params.id);
    if (!nota) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    res.json({ message: 'Nota eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  obtenerNotas,
  obtenerNotaPorId,
  crearNota,
  actualizarNota,
  eliminarNota,
};