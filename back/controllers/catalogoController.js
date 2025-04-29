const Catalogo = require('../models/Catalogo');
const excelToJson = require('convert-excel-to-json');
const fs = require('fs');
const path = require('path');
const catalogoValidation = require('../middlewares/catalogoValidation');

// Middleware para verificar producto
exports.verificarProducto = async (req, res, next) => {
  try {
    const producto = await Catalogo.findOne({ codigo: req.params.codigo });
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    req.producto = producto;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CRUD
exports.crearProducto = async (req, res) => {
  try {
    const producto = new Catalogo(req.body);
    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.obtenerCatalogo = async (req, res) => {
  try {
    const { categoria, estatus } = req.query;
    const filtro = {};
    if (categoria) filtro.categoria = categoria;
    if (estatus) filtro.estatus = estatus;

    const productos = await Catalogo.find(filtro);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Carga masiva desde Excel 
exports.cargarCatalogo = async (req, res) => {
  try {
    const result = excelToJson({
      source: req.file.buffer,
      header: { rows: 1 }, // Saltar cabecera
      columnToKey: {
        B: 'codigo',
        C: 'nombre',
        D: 'codigoTienda',
        E: 'categoria',
        F: 'subcategoria',
        G: 'precioCompra',
        H: 'precioSinFinanciamiento',
        I: 'precioConFinanciamiento',
        J: 'seccion',
        K: 'estatus',
        L: 'fechaCreacion',
        M: 'fechaModificacion'
      }
    });

    const productos = result.Worksheet
    .filter(item => item.codigo)
    .map(item => ({
      ...item,
      estatus: item.estatus || 'Activo'
    }));

  // Usar bulkWrite para manejar inserciones y actualizaciones
  const bulkOps = productos.map(producto => ({
    updateOne: {
      filter: { codigo: producto.codigo },
      update: { $set: producto },
      upsert: true
    }
  }));
  await Catalogo.bulkWrite(bulkOps);

  res.json({ 
    success: true, 
    count: productos.length 
  });
} catch (error) {
  res.status(500).json({ 
    error: error.message,
    details: error.keyValue
  });
}
};

// Búsquedas especializadas
exports.buscarPorCodigo = async (req, res) => {
  try {
    const producto = await Catalogo.findOne({ codigo: req.params.codigo });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerPorCategoria = async (req, res) => {
  try {
    const productos = await Catalogo.find({ 
      categoria: req.params.categoria,
      estatus: 'Activo'
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// catalogoController.js
exports.actualizarProducto = async (req, res) => {
  try {
    const { codigo } = req.params;
    const producto = await Catalogo.findOneAndUpdate(
      { codigo },
      req.body,
      { new: true, runValidators: true }
    );
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};