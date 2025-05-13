// src/modules/transactions/transaction.controller.mjs

import express from 'express';
import * as transactionService from './transaction.service.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management | Gestión de transacciones
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Get all transactions (optionally filtered by user) | Obtener todas las transacciones (opcionalmente filtradas por usuario)
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID | Filtrar por ID de usuario
 *     responses:
 *       200:
 *         description: List of transactions | Lista de transacciones
 */
router.get('/', async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransactions(req.query);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get a transaction by ID | Obtener una transacción por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction found | Transacción encontrada
 *       404:
 *         description: Transaction not found | Transacción no encontrada
 */
router.get('/:id', async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a new transaction | Crear una nueva transacción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - type
 *               - amount
 *             properties:
 *               user_id:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               amount:
 *                 type: number
 *                 format: float
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created | Transacción creada
 *       400:
 *         description: Invalid request | Solicitud inválida
 */
router.post('/', async (req, res) => {
  try {
    const transaction = await transactionService.createTransaction(req.body);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Update a transaction fully | Actualizar completamente una transacción
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
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               amount:
 *                 type: number
 *                 format: float
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated | Transacción actualizada
 *       404:
 *         description: Transaction not found | Transacción no encontrada
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await transactionService.updateTransaction(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   patch:
 *     tags: [Transactions]
 *     summary: Partially update a transaction | Actualizar parcialmente una transacción
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
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               amount:
 *                 type: number
 *                 format: float
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction partially updated | Transacción parcialmente actualizada
 *       404:
 *         description: Transaction not found | Transacción no encontrada
 */
router.patch('/:id', async (req, res) => {
  try {
    const updated = await transactionService.updateTransaction(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Transaction not found or no fields to update' });
    res.json({ message: 'Transaction patched' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete a transaction | Eliminar una transacción
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction deleted | Transacción eliminada
 *       404:
 *         description: Transaction not found | Transacción no encontrada
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await transactionService.deleteTransaction(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
