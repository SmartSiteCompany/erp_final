const Opportunity = require('../models/Oportunidades'); 

// Obtener todas las oportunidades
const obtenerOportunidades = async (req, res) => {
  try {
    const oportunidades = await Opportunity.find().populate('cliente_id');
    res.json(oportunidades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener una oportunidad por ID
const obtenerOportunidadPorId = async (req, res) => {
  try {
    const oportunidad = await Opportunity.findById(req.params.id).populate('cliente_id');
    if (!oportunidad) {
      return res.status(404).json({ error: 'Oportunidad no encontrada' });
    }
    res.json(oportunidad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Crear una nueva oportunidad
const crearOportunidad = async (req, res) => {
  const oportunidad = new Opportunity(req.body);
  try {
    await oportunidad.save();
    res.status(201).json(oportunidad);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Actualizar una oportunidad
const actualizarOportunidad = async (req, res) => {
  try {
    const oportunidad = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!oportunidad) {
      return res.status(404).json({ error: 'Oportunidad no encontrada' });
    }
    res.json(oportunidad);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Eliminar una oportunidad
const eliminarOportunidad = async (req, res) => {
  try {
    const oportunidad = await Opportunity.findByIdAndDelete(req.params.id);
    if (!oportunidad) {
      return res.status(404).json({ error: 'Oportunidad no encontrada' });
    }
    res.json({ message: 'Oportunidad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  obtenerOportunidades,
  obtenerOportunidadPorId,
  crearOportunidad,
  actualizarOportunidad,
  eliminarOportunidad
};