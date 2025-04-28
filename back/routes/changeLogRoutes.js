// src/routes/changeLogRoutes.js
const express = require('express');
const router = express.Router();
const changeLogController = require('../controllers/changeLogController');

/**
 * @swagger
 * tags:
 *   name: ChangeLog
 *   description: Auditoría de cambios en registros del sistema
 */

/**
 * @swagger
 * /api/change-logs:
 *   get:
 *     summary: Obtener todos los registros de cambios
 *     tags: [ChangeLog]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de cliente
 *       - in: query
 *         name: responsable
 *         schema:
 *           type: string
 *         description: Filtrar por email del responsable
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar cambios desde esta fecha (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de registros de cambios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChangeLog'
 *       403:
 *         description: No autorizado (requiere rol admin)
 */
router.get('/', changeLogController.obtenerChangeLogs);

/**
 * @swagger
 * /api/change-logs/{id}:
 *   get:
 *     summary: Obtener un registro de cambio específico
 *     tags: [ChangeLog]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "611f1f77bcf86cd799433355"
 *     responses:
 *       200:
 *         description: Detalles completos del registro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChangeLogDetallado'
 *       404:
 *         description: Registro no encontrado
 */
router.get('/:id', changeLogController.obtenerChangeLogPorId);

/**
 * @swagger
 * /api/change-logs:
 *   post:
 *     summary: Registrar un nuevo cambio (Automático)
 *     description: Normalmente usado por el sistema, no requiere llamada manual
 *     tags: [ChangeLog]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeLog'
 *     responses:
 *       201:
 *         description: Cambio registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChangeLog'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', changeLogController.crearChangeLog);

/**
 * @swagger
 * /api/change-logs/{id}:
 *   put:
 *     summary: Actualizar registro de cambio (Restringido)
 *     description: Solo para correcciones administrativas
 *     tags: [ChangeLog]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               justificacion:
 *                 type: string
 *                 example: "Corrección de error en captura inicial"
 *               cambios:
 *                 $ref: '#/components/schemas/ChangeLog'
 *     responses:
 *       200:
 *         description: Registro actualizado
 *       403:
 *         description: Requiere rol de administrador
 *       404:
 *         description: Registro no encontrado
 */
router.put('/:id', changeLogController.actualizarChangeLog);

/**
 * @swagger
 * /api/change-logs/{id}:
 *   delete:
 *     summary: Eliminar registro de cambio (Altamente restringido)
 *     tags: [ChangeLog]
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
 *         description: Registro eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Registro eliminado (justificación: duplicado)"
 *       403:
 *         description: Requiere permisos de superadmin
 *       404:
 *         description: Registro no encontrado
 */
router.delete('/:id', changeLogController.eliminarChangeLog);

module.exports = router;