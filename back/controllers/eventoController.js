const Event = require('../models/Eventos');

// Obtener todos los eventos
const obtenerEventos = async(req, res) => {
  try {
    const eventos = await Event.find().populate('clientes');
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener un evento por ID
const obtenerEventoPorId = async(req, res) => {
  try {
    const evento = await Event.findById(req.params.id).populate('clientes');
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.json(evento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Crear un nuevo evento
const crearEvento = async(req, res) => {
  const evento = new Event(req.body);
  try {
    await evento.save();
    res.status(201).json(evento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Actualizar un evento
const actualizarEvento = async(req, res) => {
  try {
    const evento = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.json(evento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Eliminar un evento
const eliminarEvento = async(req, res) => {
  try {
    const evento = await Event.findByIdAndDelete(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  obtenerEventos,
  obtenerEventoPorId,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
};