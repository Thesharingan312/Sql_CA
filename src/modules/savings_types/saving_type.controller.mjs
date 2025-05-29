// src/modules/saving_types/saving_type.controller.mjs

import express from 'express';
import * as savingTypeService from './saving_type.service.mjs';
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs';

const router = express.Router();

/**
 *  @swagger
 *  tags:
 *   - name: Saving Types
 *     description: Management of saving types (e.g., emergency fund, house down payment) | Gestión de tipos de ahorro (ej. fondo de emergencia, pago inicial de casa)
 */

/**
 *  @swagger
 *  /saving_types:
 *   get:
 *     tags: [Saving Types]
 *     summary: Get all saving types | Obtener todos los tipos de ahorro
 *     responses:
 *       200:
 *         description: List of saving types | Lista de tipos de ahorro
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *       500:
 *         description: Server error | Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ocurrió un error en el servidor. Por favor, inténtelo de nuevo más tarde."
 */
router.get('/', async (req, res) => {
    try {
        const types = await savingTypeService.getAllSavingTypes();
        res.json(types);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
    });

/**
 *  @swagger
 *  /saving_types/{id}:
 *   get:
 *     tags: [Saving Types]
 *     summary: Get saving type by ID | Obtener tipo de ahorro por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Saving type found | Tipo de ahorro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *       400:
 *         description: Invalid ID | ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID inválido. El ID debe ser un número entero positivo."
 *       404:
 *         description: Saving type not found | Tipo de ahorro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tipo de ahorro no encontrado."
 *       500:
 *         description: Server error | Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ocurrió un error en el servidor. Por favor, inténtelo de nuevo más tarde."
 */
router.get('/:id', async (req, res) => {
    try {
        const type = await savingTypeService.getSavingTypeById(req.params.id);
        res.json(type);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
    });

/**
 *  @swagger
 *  /saving_types:
 *   post:
 *     tags: [Saving Types]
 *     summary: Create a new saving type | Crear un nuevo tipo de ahorro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Saving type created | Tipo de ahorro creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *       400:
 *         description: Invalid input | Entrada inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Faltan campos obligatorios en la solicitud."
 *       409:
 *         description: Saving type name already exists | El nombre del tipo de ahorro ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El nombre del tipo de ahorro ya existe."
 *       500:
 *         description: Server error | Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ocurrió un error en el servidor. Por favor, inténtelo de nuevo más tarde."
 */
router.post('/', async (req, res) => {
    try {
        const newType = await savingTypeService.createSavingType(req.body);
        res.status(201).json(newType);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
    });

/**
 *  @swagger
 *  /saving_types/{id}:
 *   put:
 *     tags: [Saving Types]
 *     summary: Update an existing saving type | Actualizar un tipo de ahorro existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Saving type updated | Tipo de ahorro actualizado
 *       400:
 *         description: Invalid input | Entrada inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Faltan campos obligatorios en la solicitud."
 *       404:
 *         description: Saving type not found | Tipo de ahorro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tipo de ahorro no encontrado."
 *       409:
 *         description: Saving type name already exists | El nombre del tipo de ahorro ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El nombre del tipo de ahorro ya existe."
 *       500:
 *         description: Server error | Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ocurrió un error en el servidor. Por favor, inténtelo de nuevo más tarde."
 */
router.put('/:id', async (req, res) => {
    try {
        await savingTypeService.updateSavingType(req.params.id, req.body);
        res.json({ message: 'Saving type updated' });
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
    });

/**
 *  @swagger
 *  /saving_types/{id}:
 *   delete:
 *     tags: [Saving Types]
 *     summary: Delete a saving type | Eliminar un tipo de ahorro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Saving type deleted | Tipo de ahorro eliminado
 *       400:
 *         description: Invalid ID | ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID inválido. El ID debe ser un número entero positivo."
 *       404:
 *         description: Saving type not found | Tipo de ahorro no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tipo de ahorro no encontrado."
 *       409:
 *         description: Conflict, e.g., associated savings exist | Conflicto, ej. existen ahorros asociados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No se puede eliminar el tipo de ahorro: existen ahorros asociados."
 *       500:
 *         description: Server error | Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ocurrió un error en el servidor. Por favor, inténtelo de nuevo más tarde."
 */
router.delete('/:id', async (req, res) => {
    try {
        await savingTypeService.deleteSavingType(req.params.id);
        res.json({ message: 'Saving type deleted' });
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
    });

export default router;