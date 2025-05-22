import express from 'express';
import * as categoryService from './category.service.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Management of transaction categories (e.g., food, transport) | Gestión de categorías de transacción (ej. comida, transporte)
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories | Obtener todas las categorías
 *     responses:
 *       200:
 *         description: List of categories | Lista de categorías
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
        const categories = await categoryService.getAllCategories();
        res.json(categories);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID | Obtener categoría por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category found | Categoría encontrada
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
 *         description: Category not found | Categoría no encontrada
 *       500:
 *         description: Server error | Error del servidor
 */
router.get('/:id', async (req, res) => {
    try {
        const category = await categoryService.getCategoryById(req.params.id);
        res.json(category);
    }
    catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category | Crear una nueva categoría
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
 *         description: Category created | Categoría creada
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
 *         description: Category name already exists | El nombre de la categoría ya existe
 *       500:
 *         description: Server error | Error del servidor
 */
router.post('/', async (req, res) => {
    try {
        const newCategory = await categoryService.createCategory(req.body);
        res.status(201).json(newCategory);
    } 
    catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update an existing category | Actualizar una categoría existente
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
 *         description: Category updated | Categoría actualizada
 *       400:
 *         description: Invalid input | Entrada inválida
 *       404:
 *         description: Category not found | Categoría no encontrada
 *       409:
 *         description: Category name already exists | El nombre de la categoría ya existe
 *       500:
 *         description: Server error | Error del servidor
 */
router.put('/:id', async (req, res) => {
    try {
        await categoryService.updateCategory(req.params.id, req.body);
        res.json({ message: 'Category updated' });
    }   
    catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category | Eliminar una categoría
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category deleted | Categoría eliminada
 *       400:
 *         description: Invalid ID | ID inválido
 *       404:
 *         description: Category not found | Categoría no encontrada
 *       409:
 *         description: Conflict, e.g., associated transactions exist | Conflicto, ej. existen transacciones asociadas
 *       500:
 *         description: Server error | Error del servidor
 */
router.delete('/:id', async (req, res) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.json({ message: 'Category deleted' });
    }
    catch (err) {
        res.status(err.status || 500).json({ error: err.message });
    }
});

export default router;
