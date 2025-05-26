// src/modules/transaction_types/transaction_type.controller.mjs

import express from 'express';
import * as transactionTypeService from './transaction_type.service.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Transaction Types
 *     description: Management of transaction types (e.g., income, expense, transfer) | Gestión de tipos de transacción (ej. ingreso, gasto, transferencia)
 */

/**
 * @swagger
 * /transaction_types:
 *   get:
 *     tags: [Transaction Types]
 *     summary: Get all transaction types | Obtener todos los tipos de transacción
 *     responses:
 *       200:
 *         description: List of transaction types | Lista de tipos de transacción
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
 */
router.get('/', async (req, res) => {
    try {
        const types = await transactionTypeService.getAllTransactionTypes();
        res.json(types);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /transaction_types/{id}:
 *   get:
 *     tags: [Transaction Types]
 *     summary: Get transaction type by ID | Obtener tipo de transacción por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction type found | Tipo de transacción encontrado
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
 *       404:
 *         description: Transaction type not found | Tipo de transacción no encontrado
 *       500:
 *         description: Server error | Error del servidor
 */
router.get('/:id', async (req, res) => {
    try {
        const type = await transactionTypeService.getTransactionTypeById(req.params.id);
        res.json(type);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /transaction_types:
 *   post:
 *     tags: [Transaction Types]
 *     summary: Create a new transaction type | Crear un nuevo tipo de transacción
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
 *         description: Transaction type created | Tipo de transacción creado
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
 *       409:
 *         description: Transaction type name already exists | El nombre del tipo de transacción ya existe
 *       500:
 *         description: Server error | Error del servidor
 */
router.post('/', async (req, res) => {
    try {
        const newType = await transactionTypeService.createTransactionType(req.body);
        res.status(201).json(newType);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /transaction_types/{id}:
 *   put:
 *     tags: [Transaction Types]
 *     summary: Update an existing transaction type | Actualizar un tipo de transacción existente
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
 *         description: Transaction type updated | Tipo de transacción actualizado
 *       400:
 *         description: Invalid input | Entrada inválida
 *       404:
 *         description: Transaction type not found | Tipo de transacción no encontrado
 *       409:
 *         description: Transaction type name already exists | El nombre del tipo de transacción ya existe
 *       500:
 *         description: Server error | Error del servidor
 */
router.put('/:id', async (req, res) => {
    try {
        await transactionTypeService.updateTransactionType(req.params.id, req.body);
        res.json({ message: 'Transaction type updated' });
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /transaction_types/{id}:
 *   delete:
 *     tags: [Transaction Types]
 *     summary: Delete a transaction type | Eliminar un tipo de transacción
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction type deleted | Tipo de transacción eliminado
 *       400:
 *         description: Invalid ID | ID inválido
 *       404:
 *         description: Transaction type not found | Tipo de transacción no encontrado
 *       409:
 *         description: Conflict, e.g., associated transactions exist | Conflicto, ej. existen transacciones asociadas
 *       500:
 *         description: Server error | Error del servidor
 */
router.delete('/:id', async (req, res) => {
    try {
        await transactionTypeService.deleteTransactionType(req.params.id);
        res.json({ message: 'Transaction type deleted' });
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

export default router;
