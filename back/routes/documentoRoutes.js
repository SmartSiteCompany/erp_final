// src/routes/documentoRoutes.js
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentoController');
const { uploadDoc } = require('../middlewares/upload');

/**
 * @swagger
 * tags:
 *   name: Documentos
 *   description: Gestión de documentos (contratos, facturas, etc.)
 */

/**
 * @swagger
 * /api/documentos:
 *   get:
 *     summary: Listar documentos
 *     tags: [Documentos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de cliente
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [contrato, factura, propuesta, otro]
 *         description: Filtrar por tipo de documento
 *     responses:
 *       200:
 *         description: Lista de documentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DocumentoResumen'
 */
router.get('/', documentController.obtenerDocumentos);

/**
 * @swagger
 * /api/documentos/{id}:
 *   get:
 *     summary: Obtener metadatos de documento
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "611f1f77bcf86cd799433333"
 *     responses:
 *       200:
 *         description: Metadatos del documento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Documento'
 *       404:
 *         description: Documento no encontrado
 */
router.get('/:id', documentController.obtenerDocumentoPorId);

/**
 * @swagger
 * /api/documentos/upload:
 *   post:
 *     summary: Subir documento (multipart)
 *     tags: [Documentos]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - archivo
 *               - cliente_id
 *               - tipo
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a subir (PDF, DOCX, etc.)
 *               cliente_id:
 *                 type: string
 *                 example: "611f1f77bcf86cd799433333"
 *               nombre:
 *                 type: string
 *                 example: "Contrato-001"
 *               tipo:
 *                 type: string
 *                 enum: [contrato, factura, propuesta, otro]
 *                 example: "contrato"
 *     responses:
 *       201:
 *         description: Documento subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Documento'
 *       400:
 *         description: Error en el archivo o datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUpload'
 */
router.post('/', documentController.crearDocumento);

// Subir un nuevo documento
/**
 * @swagger
 * /api/documentos/upload:
 *   post:
 *     summary: Subir un documento (multipart/form-data)
 *     description: |
 *       Endpoint para carga de archivos (PDF, DOCX, etc.) con metadata asociada.
 *       Límite de tamaño: 10MB. Formatos permitidos: PDF, DOCX, XLSX.
 *     tags: [Documentos]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - archivo
 *               - cliente_id
 *               - tipo
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a subir (max 10MB)
 *               cliente_id:
 *                 type: string
 *                 example: "611f1f77bcf86cd799433333"
 *                 description: ID del cliente asociado al documento
 *               nombre:
 *                 type: string
 *                 example: "Contrato-Servicio-2023"
 *                 description: Nombre descriptivo del documento
 *               tipo:
 *                 type: string
 *                 enum: [contrato, factura, propuesta, otro]
 *                 example: "contrato"
 *                 description: Tipo de documento
 *     responses:
 *       201:
 *         description: Documento subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Documento'
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             description: URL del documento recién creado
 *             example: "/api/documentos/611f1f77bcf86cd799433555"
 *       400:
 *         description: Error en los datos o archivo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El archivo excede el tamaño máximo"
 *                 detalles:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "Tamaño máximo permitido: 10MB"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al guardar en la base de datos"
 */
router.post('/upload', uploadDoc.single('archivo'), async (req, res) => {
    try {
      const { cliente_id, nombre, tipo } = req.body;  
      const nuevoDocumento = new Documento({
        cliente_id,
        nombre,
        tipo,
        archivo: req.file.path, // Ej: "uploads/documents/doc-987654321.pdf"
        tamaño: req.file.size, // Tamaño en bytes
        formato: req.file.mimetype, // Ej: "application/pdf"
      });
  
      await nuevoDocumento.save();
      res.status(201).json(nuevoDocumento);
    } catch (error) {
      res.status(500).json({ error: 'Error al subir el documento' });
    }
  });

/**
 * @swagger
 * /api/documentos/{id}:
 *   put:
 *     summary: Actualizar metadatos de documento
 *     tags: [Documentos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Contrato-001-actualizado"
 *               tipo:
 *                 type: string
 *                 enum: [contrato, factura, propuesta, otro]
 *     responses:
 *       200:
 *         description: Metadatos actualizados
 *       403:
 *         description: No autorizado para modificar este documento
 */
router.put('/:id', documentController.actualizarDocumento);

/**
 * @swagger
 * /api/documentos/{id}:
 *   delete:
 *     summary: Eliminar documento
 *     tags: [Documentos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Documento eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Documento eliminado"
 *                 archivo_eliminado:
 *                   type: string
 *                   example: "uploads/documents/doc-123.pdf"
 *       404:
 *         description: Documento no encontrado
 */
router.delete('/:id', documentController.eliminarDocumento);
module.exports = router;