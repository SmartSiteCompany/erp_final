// src/routes/campanaRoutes.js
const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campanaController');

/**
 * @swagger
 * tags:
 *   name: Campañas
 *   description: Gestión de campañas de marketing y promociones
 */

/**
 * @swagger
 * /api/campanas:
 *   get:
 *     summary: Obtener todas las campañas
 *     tags: [Campañas]
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activa, inactiva, completada]
 *         description: Filtrar por estado de campaña
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar campañas posteriores a esta fecha (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de campañas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Campana'
 *       401:
 *         description: No autorizado
 */
router.get('/', campaignController.obtenerCampaigns);

/**
 * @swagger
 * /api/campanas/{id}:
 *   get:
 *     summary: Obtener una campaña específica
 *     tags: [Campañas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "611f1f77bcf86cd799433333"
 *     responses:
 *       200:
 *         description: Detalles completos de la campaña
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CampanaCompleta'
 *       404:
 *         description: Campaña no encontrada
 */
router.get('/:id', campaignController.obtenerCampaignPorId);

/**
 * @swagger
 * /api/campanas:
 *   post:
 *     summary: Crear nueva campaña
 *     tags: [Campañas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Campana'
 *     responses:
 *       201:
 *         description: Campaña creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campana'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidacion'
 */
router.post('/', campaignController.crearCampaign);

/**
 * @swagger
 * /api/campanas/{id}:
 *   put:
 *     summary: Actualizar campaña existente
 *     tags: [Campañas]
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
 *             $ref: '#/components/schemas/Campana'
 *     responses:
 *       200:
 *         description: Campaña actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campana'
 *       403:
 *         description: No tienes permisos para esta acción
 *       404:
 *         description: Campaña no encontrada
 */
router.put('/:id', campaignController.actualizarCampaign);

/**
 * @swagger
 * /api/campanas/{id}:
 *   delete:
 *     summary: Eliminar campaña
 *     tags: [Campañas]
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
 *         description: Campaña eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Campaña eliminada correctamente"
 *                 id:
 *                   type: string
 *                   example: "611f1f77bcf86cd799433333"
 *       403:
 *         description: No autorizado (solo administradores)
 *       409:
 *         description: Conflicto (campaña con clientes asociados)
 */
router.delete('/:id', campaignController.eliminarCampaign);

module.exports = router;