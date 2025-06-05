import express from 'express';
import * as reportsService from './reports.service.mjs';
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs'; // Para mensajes de error genéricos

const router = express.Router();

/**
 *  @swagger
 *  tags:
 *   name: Reports
 *   description: Generación de reportes financieros y de transacciones.
 */

/**
 *  @swagger
 *  /reports/balance:
 *   get:
 *     tags: [Reports]
 *     summary: Obtener el balance actual del usuario (ingresos - gastos).
 *     description: Calcula el balance total para un usuario, opcionalmente filtrado por un rango de fechas.
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario para generar el reporte.
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio (ISO 8601 UTC)
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin (ISO 8601 UTC)
 *     responses:
 *       200:
 *         description: Reporte de balance generado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id: { type: integer }
 *                 from_date: { type: string, format: date-time }
 *                 to_date: { type: string, format: date-time }
 *                 total_ingresos: { type: number, format: float }
 *                 total_gastos: { type: number, format: float }
 *                 balance: { type: number, format: float }
 *       400:
 *         description: Parámetros inválidos.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error del servidor.
 */
router.get('/balance', async (req, res) => {
    try {
        const userId = parseInt(req.query.user_id, 10);
        const filters = {
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };
    const report = await reportsService.generateBalanceReport(userId, filters);
    res.json(report);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

/**
 *  @swagger
 *  /reports/expenses-by-category:
 *   get:
 *     tags: [Reports]
 *     summary: Obtener gastos por categoría para un usuario.
 *     description: Muestra el total de gastos agrupados por categoría para un usuario, en un período específico (mes/año o rango de fechas).
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *       - in: query
 *         name: from_date
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to_date
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Reporte de gastos por categoría.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id: { type: integer }
 *                 from_date: { type: string, format: date-time }
 *                 to_date: { type: string, format: date-time }
 *                 expenses_by_category:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category_id: { type: integer }
 *                       category_name: { type: string }
 *                       total_spent: { type: number, format: float }
 *       400:
 *         description: Parámetros inválidos.
 *       500:
 *         description: Error del servidor.
 */
router.get('/expenses-by-category', async (req, res) => {
    try {
        const userId = parseInt(req.query.user_id, 10);
        const filters = {
            from_date: req.query.from_date,
            to_date: req.query.to_date,
            year: req.query.year ? parseInt(req.query.year, 10) : undefined,
            month: req.query.month ? parseInt(req.query.month, 10) : undefined,
        };
    const report = await reportsService.generateExpensesByCategoryReport(userId, filters);
    res.json(report);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

/**
 *  @swagger
 *  /reports/monthly-expenses:
 *   get:
 *     tags: [Reports]
 *     summary: Obtener gastos totales mes a mes.
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *         description: Año para el reporte. Si no se especifica, usa los últimos 12 meses.
 *     responses:
 *       200: { description: Reporte de gastos mensuales. }
 *       400: { description: Parámetros inválidos. }
 */
router.get('/monthly-expenses', async (req, res) => {
    try {
        const userId = parseInt(req.query.user_id, 10);
        const filters = { year: req.query.year ? parseInt(req.query.year, 10) : undefined };
        const report = await reportsService.generateMonthlyExpensesReport(userId, filters);
        res.json(report);
    }
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

/**
 *  @swagger
 *  /reports/periodic-balance:
 *   get:
 *     tags: [Reports]
 *     summary: Obtener balance (ingresos, gastos, neto) por períodos.
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: period_type
 *         schema:
 *           type: string
 *           enum: [monthly, weekly, yearly]
 *           default: monthly
 *       - in: query
 *         name: from_date
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to_date
 *         required: true
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Reporte de balance periódico. }
 *       400: { description: Parámetros inválidos. }
 */
router.get('/periodic-balance', async (req, res) => {
    try {
        const userId = parseInt(req.query.user_id, 10);
        const filters = {
            period_type: req.query.period_type,
            from_date: req.query.from_date,
            to_date: req.query.to_date
        };
    const report = await reportsService.generatePeriodicBalanceReport(userId, filters);
    res.json(report);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

/**
 *  @swagger
 *  /reports/top-categories:
 *   get:
 *     tags: [Reports]
 *     summary: Obtener las N categorías con mayores gastos.
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 5 }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *       - in: query
 *         name: from_date
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to_date
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Reporte de top categorías. }
 *       400: { description: Parámetros inválidos. }
 */
router.get('/top-categories', async (req, res) => {
    try {
        const userId = parseInt(req.query.user_id, 10);
        const filters = {
            limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
            from_date: req.query.from_date,
            to_date: req.query.to_date,
            year: req.query.year ? parseInt(req.query.year, 10) : undefined,
            month: req.query.month ? parseInt(req.query.month, 10) : undefined,
        };
    const report = await reportsService.generateTopCategoriesReport(userId, filters);
    res.json(report);
    }
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

/**
 *  @swagger
 *  /reports/spending-patterns:
 *   get:
 *     tags: [Reports]
 *     summary: Comparar patrones de gasto entre dos períodos.
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: period1_from_date
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: period1_to_date
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: period2_from_date
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: period2_to_date
 *         required: true
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200: { description: Reporte de patrones de gasto. }
 *       400: { description: Parámetros inválidos. }
 */
router.get('/spending-patterns', async (req, res) => {
    try {
        const userId = parseInt(req.query.user_id, 10);
        const filters = {
            period1_from_date: req.query.period1_from_date,
            period1_to_date: req.query.period1_to_date,
            period2_from_date: req.query.period2_from_date,
            period2_to_date: req.query.period2_to_date,
        };
    const report = await reportsService.generateSpendingPatternsReport(userId, filters);
    res.json(report);
    }
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

/**
 *  @swagger
 *  /reports/forecast:
 *   get:
 *     tags: [Reports]
 *     summary: Pronóstico de gastos basado en historial.
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: history_months
 *         schema: { type: integer, default: 3 }
 *         description: Número de meses de historial a considerar
 *     responses:
 *       200: { description: Reporte de pronóstico de gastos. }
 *       400: { description: Parámetros inválidos. }
 */
router.get('/forecast', async (req, res) => {
    try {
        const userId = parseInt(req.query.user_id, 10);
        const filters = {
        history_months: req.query.history_months ? parseInt(req.query.history_months, 10) : undefined
        };
    const report = await reportsService.generateForecastReport(userId, filters);
    res.json(report);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || ERROR_MESSAGES.SERVER_ERROR });
    }
});

export default router;
