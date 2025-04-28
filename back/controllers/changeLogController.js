const ChangeLog = require('../models/changeLogModel');

// Obtener todos los registros de cambios
const obtenerChangeLogs = async (req, res) => {
  try {
    const changeLogs = await ChangeLog.find().populate('cliente_id');
    res.json(changeLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Obtener un registro de cambio por ID
const obtenerChangeLogPorId = async (req, res) => {
  try {
    const changeLog = await ChangeLog.findById(req.params.id).populate('cliente_id');
    if (!changeLog) {
      return res.status(404).json({ error: 'Registro de cambio no encontrado' });
    }
    res.json(changeLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Crear un nuevo registro de cambio
const crearChangeLog = async (req, res) => {
  const changeLog = new ChangeLog(req.body);
  try {
    await changeLog.save();
    res.status(201).json(changeLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Actualizar un registro de cambio
const actualizarChangeLog = async (req, res) => {
  try {
    const changeLog = await ChangeLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!changeLog) {
      return res.status(404).json({ error: 'Registro de cambio no encontrado' });
    }
    res.json(changeLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Eliminar un registro de cambio
const eliminarChangeLog = async (req, res) => {
  try {
    const changeLog = await ChangeLog.findByIdAndDelete(req.params.id);
    if (!changeLog) {
      return res.status(404).json({ error: 'Registro de cambio no encontrado' });
    }
    res.json({ message: 'Registro de cambio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  obtenerChangeLogs,
  obtenerChangeLogPorId,
  crearChangeLog,
  actualizarChangeLog,
  eliminarChangeLog,
};