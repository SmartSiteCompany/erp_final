const Filial = require('../models/Filial');

// Obtener todas las filiales
const obtenerFiliales = async (req, res) => {
  try {
    const filiales = await Filial.find();
    res.json(filiales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una nueva filial
const crearFilial = async (req, res) => {
  const filial = new Filial(req.body);
  try {
    await filial.save();
    res.status(201).json(filial);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener una filial por ID
const obtenerFilialPorId = async (req, res) => {
  try {
    const filial = await Filial.findById(req.params.id);
    if (!filial) {
      return res.status(404).json({ error: 'Filial no encontrada' });
    }
    res.json(filial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una filial
const actualizarFilial = async (req, res) => {
  try {
    const filial = await Filial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!filial) {
      return res.status(404).json({ error: 'Filial no encontrada' });
    }
    res.json(filial);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar una filial
const eliminarFilial = async (req, res) => {
  try {
    const filial = await Filial.findByIdAndDelete(req.params.id);
    if (!filial) {
      return res.status(404).json({ error: 'Filial no encontrada' });
    }
    res.json({ message: 'Filial eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerFiliales,
  crearFilial,
  obtenerFilialPorId,
  actualizarFilial,
  eliminarFilial,
};