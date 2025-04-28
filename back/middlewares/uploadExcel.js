const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const XLSX = require('xlsx');
//const AppError = require('../utils/appError'); 

// ==============================================
// Configuración Simplificada de Multer 
// ==============================================
const upload = multer({
  storage: multer.memoryStorage(), // Procesamos en memoria sin guardar archivos
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError('Solo se permiten archivos Excel (.xlsx, .xls)', 400), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ==============================================
// Validación de Estructura
// ==============================================
const validateExcelStructure = (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No se subió ningún archivo', 400));
  }

  try {
    const workbook = XLSX.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const firstRow = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];

    // Columnas requeridas según tu Excel
    const requiredColumns = [
      'Codigo Smart',    // B
      'Descripción',     // C
      'Categoria',       // E
      'Precio de compra' // G
    ];

    const missingColumns = requiredColumns.filter(
      col => !firstRow.includes(col)
    );

    if (missingColumns.length > 0) {
      return next(new AppError(
        `Faltan columnas requeridas: ${missingColumns.join(', ')}`,
        400
      ));
    }

    req.workbook = workbook;
    next();
  } catch (error) {
    next(new AppError('Error al leer el archivo: ' + error.message, 500));
  }
};

// ==============================================
// Conversión a JSON (Mapeo exacto de columnas)
// ==============================================
const excelToJson = (req, res, next) => {
  try {
    const worksheet = req.workbook.Sheets[req.workbook.SheetNames[0]];
    const productos = XLSX.utils.sheet_to_json(worksheet)
      .map(item => ({
        codigo: item['Codigo Smart']?.toString().trim(),
        nombre: item['Descripción']?.toString().trim(),
        codigoTienda: item['Codigo de tienda']?.toString().trim(),
        categoria: item['Categoria']?.toString().trim(),
        subcategoria: item['Subcategoria']?.toString().trim(),
        precioCompra: Number(item['Precio de compra']) || 0,
        precioSinFinanciamiento: Number(item['Sin fincanciamiento']) || 0,
        precioConFinanciamiento: Number(item['Con financiamiento']) || 0,
        seccion: item['Sección']?.toString().trim(),
        estatus: item['Estatus'] === 'Activo' ? 'Activo' : 'Inactivo',
        fechaCreacion: item['Fecha de Creación'] 
          ? new Date(item['Fecha de Creación']) 
          : new Date(),
        fechaModificacion: item['Fecha de Modificación'] 
          ? new Date(item['Fecha de Modificación']) 
          : new Date()
      }))
      .filter(item => item.codigo && item.nombre); // Filtramos filas vacías

    req.productosExcel = productos;
    next();
  } catch (error) {
    next(new AppError('Error al convertir Excel: ' + error.message, 500));
  }
};

// ==============================================
// Exportación 
// ==============================================
module.exports = {
  singleUpload: upload.single('archivo'),
  validateExcelStructure,
  excelToJson,
  validateProductData: (req, res, next) => next() // Valida en el controlador
};