const Campaign = require('../models/Campanas');

// Obtener todas las campañas
const obtenerCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('clientes');
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una campaña por ID
const obtenerCampaignPorId = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('clientes');
    if (!campaign) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una nueva campaña
const crearCampaign = async (req, res) => {
  const campaign = new Campaign(req.body);
  try {
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Actualizar una campaña
const actualizarCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar una campaña
const eliminarCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaña no encontrada' });
    }
    res.json({ message: 'Campaña eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerCampaigns,
  obtenerCampaignPorId,
  crearCampaign,
  actualizarCampaign,
  eliminarCampaign,
};