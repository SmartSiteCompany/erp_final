// src/routes/estadoCuentaRoutes.js
const express = require('express');
const router = express.Router();
const estadoCuentaController = require('../controllers/estadoCuentaController');

/**
 * @swagger
 * tags:
 *   name: Estados de Cuenta
 *   description: Gestión de estados de cuenta de clientes (saldos, pagos pendientes, etc.)
 */

/**
 * @swagger
 * /api/estados-cuenta:
 *   get:
 *     summary: Obtener todos los estados de cuenta
 *     tags: [Estados de Cuenta]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Activo, Pagado, Vencido, Cancelado]
 *         description: Filtrar por estado de cuenta
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de cliente
 *     responses:
 *       200:
 *         description: Lista de estados de cuenta
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EstadoCuenta'
 *       401:
 *         description: No autorizado (token inválido o ausente)
 */
router.get('/', estadoCuentaController.obtenerEstadosCuenta);

/**
 * @swagger
 * /api/estados-cuenta/{id}:
 *   get:
 *     summary: Obtener un estado de cuenta específico
 *     tags: [Estados de Cuenta]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "611f1f77bcf86cd799433355"
 *     responses:
 *       200:
 *         description: Detalles completos del estado de cuenta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstadoCuentaCompleto'
 *       404:
 *         description: Estado de cuenta no encontrado
 */
router.get('/:id', estadoCuentaController.obtenerEstadoCuentaPorId);

/**
 * @swagger
 * /api/estados-cuenta:
 *   post:
 *     summary: Crear nuevo estado de cuenta
 *     tags: [Estados de Cuenta]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EstadoCuenta'
 *     responses:
 *       201:
 *         description: Estado de cuenta creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstadoCuenta'
 *       400:
 *         description: Datos inválidos (ej. saldo inicial negativo)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidacion'
 */
router.post('/', estadoCuentaController.crearEstadoCuenta);

/**
 * @swagger
 * /api/estados-cuenta/{id}:
 *   put:
 *     summary: Actualizar estado de cuenta
 *     tags: [Estados de Cuenta]
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
 *             $ref: '#/components/schemas/EstadoCuenta'
 *     responses:
 *       200:
 *         description: Estado de cuenta actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EstadoCuenta'
 *       409:
 *         description: Conflicto (ej. intentar modificar cuenta pagada)
 */
router.put('/:id', estadoCuentaController.actualizarEstadoCuenta);

/**
 * @swagger
 * /api/estados-cuenta/{id}:
 *   delete:
 *     summary: Eliminar estado de cuenta
 *     tags: [Estados de Cuenta]
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
 *         description: Estado de cuenta eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Estado de cuenta eliminado correctamente"
 *                 id:
 *                   type: string
 *                   example: "611f1f77bcf86cd799433355"
 *       403:
 *         description: Operación no permitida (ej. cuenta con pagos asociados)
 */
router.delete('/:id', estadoCuentaController.eliminarEstadoCuenta);

module.exports = router;