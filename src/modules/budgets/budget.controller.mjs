// src/modules/budgets/budget.controller.mjs

import express from 'express';
import * as budgetService from './budget.service.mjs';
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Budgets
 *     description: Budget management | Gestión de presupuestos
 */

/**
 * @swagger
 * /budgets:
 *   get:
 *     tags: [Budgets]
 *     summary: Get all budgets (optionally filtered by user_id, category_id, year, month) | Obtener todos los presupuestos (opcionalmente filtrados)
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID | Filtrar por ID de usuario
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID | Filtrar por ID de categoría
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year | Filtrar por año
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Filter by month (1-12) | Filtrar por mes (1-12)
 *     responses:
 *       200:
 *         description: List of budgets | Lista de presupuestos
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
 *                   category_id:
 *                     type: integer
 *                   year:
 *                     type: integer
 *                   month:
 *                     type: integer
 *                   total_amount:
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
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
        user_id: req.query.user_id ? parseInt(req.query.user_id) : undefined,
        category_id: req.query.category_id ? parseInt(req.query.category_id) : undefined,
        year: req.query.year ? parseInt(req.query.year) : undefined,
        month: req.query.month ? parseInt(req.query.month) : undefined,
        };
        const budgets = await budgetService.getAllBudgets(filters);
        res.json(budgets);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     tags: [Budgets]
 *     summary: Get budget by ID | Obtener presupuesto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget found | Presupuesto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 category_id:
 *                   type: integer
 *                 year:
 *                   type: integer
 *                 month:
 *                   type: integer
 *                 total_amount:
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
 *         description: Budget not found | Presupuesto no encontrado
 *       500:
 *         description: Server error | Error del servidor
 */
router.get('/:id', async (req, res) => {
    try {
        const budget = await budgetService.getBudgetById(req.params.id);
        res.json(budget);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

/**
 * @swagger
 * /budgets:
 *   post:
 *     tags: [Budgets]
 *     summary: Create a new budget | Crear un nuevo presupuesto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - category_id
 *               - year
 *               - month
 *               - total_amount
 *             properties:
 *               user_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *               total_amount:
 *                 type: number
 *                 format: float
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Budget created | Presupuesto creado
 *       400:
 *         description: Invalid input | Entrada inválida
 *       409:
 *         description: Budget already exists | El presupuesto ya existe
 *       500:
 *         description: Server error | Error del servidor
 */
router.post('/', async (req, res) => {
    try {
        const newBudget = await budgetService.createBudget(req.body);
        res.status(201).json(newBudget);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

/**
 * @swagger
 * /budgets/{id}:
 *   put:
 *     tags: [Budgets]
 *     summary: Update an existing budget | Actualizar un presupuesto existente
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
 *               - category_id
 *               - year
 *               - month
 *               - total_amount
 *             properties:
 *               user_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *               total_amount:
 *                 type: number
 *                 format: float
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Budget updated | Presupuesto actualizado
 *       400:
 *         description: Invalid request | Solicitud inválida
 *       404:
 *         description: Budget not found | Presupuesto no encontrado
 *       409:
 *         description: Budget already exists | El presupuesto ya existe
 *       500:
 *         description: Server error | Error del servidor
 */
router.put('/:id', async (req, res) => {
    try {
        await budgetService.updateBudget(req.params.id, req.body);
        res.json({ message: 'Budget updated' });
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

/**
 * @swagger
 * /budgets/{id}:
 *   patch:
 *     tags: [Budgets]
 *     summary: Partially update a budget | Actualizar parcialmente un presupuesto
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
 *             properties:
 *               user_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *               total_amount:
 *                 type: number
 *                 format: float
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Budget partially updated | Presupuesto parcialmente actualizado
 *       400:
 *         description: Invalid request | Solicitud inválida
 *       404:
 *         description: Budget not found | Presupuesto no encontrado
 *       409:
 *         description: Budget already exists | El presupuesto ya existe
 *       500:
 *         description: Server error | Error del servidor
 */
router.patch('/:id', async (req, res) => {
    try {
        await budgetService.patchBudget(req.params.id, req.body);
        res.json({ message: 'Budget patched' });
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

/**
 * @swagger
 * /budgets/{id}:
 *   delete:
 *     tags: [Budgets]
 *     summary: Delete a budget | Eliminar un presupuesto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Budget deleted | Presupuesto eliminado
 *       400:
 *         description: Invalid ID | ID inválido
 *       404:
 *         description: Budget not found | Presupuesto no encontrado
 *       500:
 *         description: Server error | Error del servidor
 */
router.delete('/:id', async (req, res) => {
    try {
        await budgetService.deleteBudget(req.params.id);
        res.json({ message: 'Budget deleted' });
    }
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

export default router;
