const Task = require('../models/Tareas');

// Obtener todas las tareas
const obtenerTareas = async (req, res) => {
  try {
    const tareas = await Task.find().populate('cliente_id');
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener una tarea por ID
const obtenerTareaPorId = async (req, res) => {
  try {
    const tarea = await Task.findById(req.params.id).populate('cliente_id');
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(tarea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Crear una nueva tarea
const crearTarea = async (req, res) => {
  const tarea = new Task(req.body);
  try {
    await tarea.save();
    res.status(201).json(tarea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Actualizar una tarea
const actualizarTarea = async (req, res) => {
  try {
    const tarea = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json(tarea);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Eliminar una tarea
const eliminarTarea = async (req, res) => {
  try {
    const tarea = await Task.findByIdAndDelete(req.params.id);
    if (!tarea) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  obtenerTareas,
  obtenerTareaPorId,
  crearTarea,
  actualizarTarea,
  eliminarTarea,
};