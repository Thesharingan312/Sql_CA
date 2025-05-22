// src/modules/categories/category.dao.mjs

import db from '../../db/DBHelper.mjs';

/**
 *  Obtener todas las categorías | Get all categories
 */
export async function getAllCategories() {
    const [rows] = await db.query('SELECT * FROM categories');
    return rows;
}

/**
 *  Obtener categoría por ID | Get category by ID
 */
export async function getCategoryById(id) {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
}

/**
 *  Obtener categoría por nombre | Get category by name
 */
export async function getCategoryByName(name) {
    const [rows] = await db.query('SELECT * FROM categories WHERE name = ?', [name]);
    return rows[0];
}

/**
 *  Crear una nueva categoría | Create a new category
 */
export async function createCategory({ name }) {
    const [result] = await db.query(
        'INSERT INTO categories (name) VALUES (?)',
        [name]
    );
    return { id: result.insertId, name };
}

/**
 *  Actualizar una categoría existente | Update an existing category
 */
export async function updateCategory(id, { name }) {
    const [result] = await db.query(
        'UPDATE categories SET name = ? WHERE id = ?',
        [name, id]
    );
    return result.affectedRows > 0;
}

/**
 *  Eliminar una categoría por ID | Delete a category by ID
 */
export async function deleteCategory(id) {
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
}