// src/modules/budgets/budget.dao.mjs

import db from '../../db/DBHelper.mjs';

/**
 * Obtener todos los presupuestos con filtros opcionales y datos enriquecidos
 * Get all budgets with optional filters and enriched data
 */
export async function getAllBudgets({ user_id, category_id, year, month } = {}) {
    let sql = `
        SELECT
        b.id,
        b.user_id,
        b.category_id,
        b.year,
        b.month,
        b.total_amount,
        b.notes,
        b.created_at,
        b.updated_at,
        u.email as user_email,
        c.name as category_name
    FROM budgets b
    JOIN users u ON b.user_id = u.id
    JOIN categories c ON b.category_id = c.id
    WHERE 1=1
    `;
    const values = [];

    if (user_id) {
        sql += ' AND b.user_id = ?';
        values.push(user_id);
    }
    if (category_id) {
        sql += ' AND b.category_id = ?';
        values.push(category_id);
    }
    if (year) {
        sql += ' AND b.year = ?';
        values.push(year);
    }
    if (month) {
        sql += ' AND b.month = ?';
        values.push(month);
    }

    sql += ' ORDER BY b.year DESC, b.month DESC';

    const [rows] = await db.query(sql, values);
    return rows;
}

/**
 * Obtener presupuesto por ID | Get budget by ID
 */
export async function getBudgetById(id) {
    const [rows] = await db.query('SELECT * FROM budgets WHERE id = ?', [id]);
    return rows[0];
}

/**
 * Verificar si un usuario existe | Check if a user exists
 * (Esta función debería idealmente ser importada de user.dao.mjs)
 */
export async function userExists(user_id) {
    const [rows] = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
    return rows.length > 0;
}

/**
 * Verificar si una categoría existe | Check if a category exists
 * (Esta función debería idealmente ser importada de category.dao.mjs)
 */
export async function categoryExists(category_id) {
    const [rows] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    return rows.length > 0;
}

/**
 * Verificar si ya existe un presupuesto para un usuario, categoría, año y mes.
 * Check if a budget already exists for a user, category, year, and month.
 */
export async function getExistingBudgetForPeriod(user_id, category_id, year, month, excludeBudgetId = null) {
    let sql = `
        SELECT id FROM budgets
        WHERE user_id = ? AND category_id = ? AND year = ? AND month = ?
    `;
    const values = [user_id, category_id, year, month];

    if (excludeBudgetId) {
        sql += ' AND id != ?';
        values.push(excludeBudgetId);
    }

    const [rows] = await db.query(sql, values);
    return rows[0];
}


/**
 * Crear un nuevo presupuesto | Create a new budget
 */
export async function createBudget({ user_id, category_id, year, month, total_amount, notes }) {
    const [result] = await db.query(
        `INSERT INTO budgets (user_id, category_id, year, month, total_amount, notes) VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, category_id, year, month, total_amount, notes || null]
    );
    return { id: result.insertId, user_id, category_id, year, month, total_amount, notes: notes || null };
}

/**
 * Actualizar un presupuesto existente (PUT) | Update an existing budget (PUT)
 */
export async function updateBudget(id, { user_id, category_id, year, month, total_amount, notes }) {
    const [result] = await db.query(
        `UPDATE budgets SET user_id = ?, category_id = ?, year = ?, month = ?, total_amount = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [user_id, category_id, year, month, total_amount, notes || null, id]
    );
    return result.affectedRows > 0;
}

/**
 * Actualizar parcialmente un presupuesto (PATCH) | Partially update a budget (PATCH)
 */
export async function patchBudget(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return false;

    const setClause = keys.map(key => {
        if (key === 'notes' && (fields[key] === null || fields[key] === undefined)) {
        return 'notes = NULL';
        }
        return `${key} = ?`;
    }).join(', ');

    const values = keys.map(key => {
        if (key === 'notes' && (fields[key] === null || fields[key] === undefined)) {
        return undefined; // Este valor será filtrado
        }
        return fields[key];
    }).filter(value => value !== undefined);

  values.push(id); // Añadir el ID al final de los valores

    const [result] = await db.query(
    `UPDATE budgets SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
    );
    return result.affectedRows > 0;
}

/**
 * Eliminar un presupuesto por ID | Delete a budget by ID
 */
export async function deleteBudget(id) {
    const [result] = await db.query('DELETE FROM budgets WHERE id = ?', [id]);
    return result.affectedRows > 0;
}