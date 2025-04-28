const Feedback = require('../models/Feedback');

// Obtener todos los feedbacks
const obtenerFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate('cliente_id');
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener un feedback por ID
const obtenerFeedbackPorId = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate('cliente_id');
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback no encontrado' });
    }
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Crear un nuevo feedback
const crearFeedback = async (req, res) => {
  const feedback = new Feedback(req.body);
  try {
    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Actualizar un feedback
const actualizarFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback no encontrado' });
    }
    res.json(feedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Eliminar un feedback
const eliminarFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback no encontrado' });
    }
    res.json({ message: 'Feedback eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  obtenerFeedbacks,
  obtenerFeedbackPorId,
  crearFeedback,
  actualizarFeedback,
  eliminarFeedback,
};