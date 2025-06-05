// src/modules/savings/saving.controller.mjs

import express from 'express';
import * as savingService from './saving.service.mjs';
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs';

const router = express.Router();

/**
 *  @swagger
 *  tags:
 *   - name: Savings
 *     description: Savings management | Gestión de ahorros
 */

/**
 *  @swagger
 *  /savings:
 *   get:
 *     tags: [Savings]
 *     summary: Get all savings (optionally filtered by user_id, type_id) | Obtener todos los ahorros (opcionalmente filtrados por user_id, type_id)
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID | Filtrar por ID de usuario
 *       - in: query
 *         name: type_id
 *         schema:
 *           type: integer
 *         description: Filter by saving type ID | Filtrar por ID de tipo de ahorro
 *     responses:
 *       200:
 *         description: List of savings | Lista de ahorros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   type_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   amount:
 *                     type: number
 *                     format: float
 *                   notes:
 *                     type: string
 *                     nullable: true
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error | Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
        user_id: req.query.user_id ? parseInt(req.query.user_id) : undefined,
        type_id: req.query.type_id ? parseInt(req.query.type_id) : undefined,
        };
        const savings = await savingService.getAllSavings(filters);
        res.json(savings);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
    });

/**
 *  @swagger
 *  /savings/{id}:
 *   get:
 *     tags: [Savings]
 *     summary: Get saving by ID | Obtener ahorro por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Saving ID | ID del ahorro
 *     responses:
 *       200:
 *         description: Saving found | Ahorro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 type_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 amount:
 *                   type: number
 *                   format: float
 *                 notes:
 *                   type: string
 *                   nullable: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid ID | ID inválido
 *       404:
 *         description: Saving not found | Ahorro no encontrado
 *       500:
 *         description: Server error | Error del servidor
 */
router.get('/:id', async (req, res) => {
    try {
        const saving = await savingService.getSavingById(req.params.id);
        res.json(saving);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
    });

/**
 *  @swagger
 *  /savings:
 *   post:
 *     tags: [Savings]
 *     summary: Create a new saving | Crear un nuevo ahorro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - type_id
 *               - name
 *               - amount
 *             properties:
 *               user_id:
 *                 type: integer
 *               type_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: float
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Saving created | Ahorro creado
 *       400:
 *         description: Invalid input | Entrada inválida
 *       500:
 *         description: Server error | Error del servidor
 */
router.post('/', async (req, res) => {
    try {
        const newSaving = await savingService.createSaving(req.body);
        res.status(201).json(newSaving);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
    });

/**
 *  @swagger
 *  /savings/{id}:
 *   put:
 *     tags: [Savings]
 *     summary: Update an existing saving | Actualizar un ahorro existente
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
 *               - user_id
 *               - type_id
 *               - name
 *               - amount
 *             properties:
 *               user_id:
 *                 type: integer
 *               type_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: float
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Saving updated | Ahorro actualizado
 *       400:
 *         description: Invalid input | Entrada inválida
 *       404:
 *         description: Saving not found | Ahorro no encontrado
 *       500:
 *         description: Server error | Error del servidor
 */
router.put('/:id', async (req, res) => {
    try {
        await savingService.updateSaving(req.params.id, req.body);
        res.json({ message: 'Saving updated' });
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
    });

/**
 *  @swagger
 *  /savings/{id}:
 *   patch:
 *     tags: [Savings]
 *     summary: Partially update a saving | Actualizar parcialmente un ahorro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               type_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: float
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Saving partially updated | Ahorro parcialmente actualizado
 *       400:
 *         description: Invalid input | Entrada inválida
 *       404:
 *         description: Saving not found | Ahorro no encontrado
 *       500:
 *         description: Server error | Error del servidor
 */
//by @Thesharingan312
router.patch('/:id', async (req, res) => {
    try {
        await savingService.patchSaving(req.params.id, req.body);
        res.json({ message: 'Saving patched' });
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
    });

/**
 *  @swagger
 *  /savings/{id}:
 *   delete:
 *     tags: [Savings]
 *     summary: Delete a saving | Eliminar un ahorro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Saving deleted | Ahorro eliminado
 *       400:
 *         description: Invalid ID | ID inválido
 *       404:
 *         description: Saving not found | Ahorro no encontrado
 *       500:
 *         description: Server error | Error del servidor
 */
router.delete('/:id', async (req, res) => {
    try {
        await savingService.deleteSaving(req.params.id);
        res.json({ message: 'Saving deleted' });
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
    });

export default router;