// src/routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: Gestión de clientes (individuales/empresas)
 */

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Listar todos los clientes
 *     tags: [Clientes]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [Individual, Empresa]
 *         description: Filtrar por tipo de cliente
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Activo, Inactivo]
 *         description: Filtrar por estado
 *       - in: query
 *         name: filial
 *         schema:
 *           type: string
 *           enum: [DataX, StudioDesign, GeneralSystech, SmartSite]
 *         description: Filtrar por filial asociada
 *     responses:
 *       200:
 *         description: Lista de clientes paginada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 50
 *                 clientes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClienteResumen'
 *       401:
 *         description: No autorizado
 */
router.get('/', clienteController.obtenerClientes);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Registrar nuevo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             description: URL del nuevo recurso
 *             example: "/api/clientes/611f1f77bcf86cd799433333"
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidacion'
 */
router.post('/', clienteController.crearCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtener detalles completos de un cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "611f1f77bcf86cd799433333"
 *     responses:
 *       200:
 *         description: Detalles del cliente con relaciones
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClienteCompleto'
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/:id', clienteController.obtenerClientePorId);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualizar cliente existente
 *     tags: [Clientes]
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
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       403:
 *         description: No tienes permisos para editar este cliente
 *       404:
 *         description: Cliente no encontrado
 */
router.put('/:id', clienteController.actualizarCliente);

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     summary: Desactivar cliente (eliminación lógica)
 *     tags: [Clientes]
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
 *         description: Cliente desactivado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Cliente desactivado (eliminación lógica)"
 *                 cliente_id:
 *                   type: string
 *                   example: "611f1f77bcf86cd799433333"
 *       409:
 *         description: Conflicto (cliente con relaciones activas)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No se puede desactivar, tiene cotizaciones activas"
 *                 relaciones_activas:
 *                   type: integer
 *                   example: 3
 */
router.delete('/:id', clienteController.eliminarCliente);

module.exports = router;