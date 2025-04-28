const multer = require('multer');
const path = require('path');

// Configuración para imágenes de usuario (foto_user)
const storageUser = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/users/'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'user-' + uniqueSuffix + ext); // Ej: user-123456789.jpg
  },
});

// Configuración para documentos PDF (archivo)
const storageDocs = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/'); // Carpeta para documentos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext); // Ej: doc-987654321.pdf
  },
});

// Filtros para aceptar solo ciertos tipos de archivos
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' || 
    file.mimetype === 'image/png' ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' || // DOC
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // DOCX
    file.mimetype === 'application/vnd.ms-excel' || // XLS
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // XLSX
    file.mimetype === 'text/csv'  // CSV
  ) {
    cb(null, true); // Aceptar el archivo
  } else {
    cb(new Error('Tipo de archivo no soportado'), false); // Rechazar
  }
};

// Filtro personalizado para imágenes (usuarios)
const imageFilter = (req, file, cb) => {
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPEG o PNG'), false);
  }
};

// Filtro personalizado para documentos
const docFilter = (req, file, cb) => {
  if (allowedDocTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

// Middlewares de Multer
const uploadUser = multer({ 
  storage: storageUser,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite: 5MB
});

const uploadDoc = multer({ 
  storage: storageDocs,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite: 10MB
});

module.exports = { uploadUser, uploadDoc };