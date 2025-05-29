// src/modules/savings/saving.dao.mjs

import db from '../../db/DBHelper.mjs';

/**
 *  Obtener todos los ahorros con filtros opcionales y datos enriquecidos
 *  Get all savings with optional filters and enriched data
 */
export async function getAllSavings({ user_id, type_id } = {}) {
    let sql = `
        SELECT
        s.id,
        s.user_id,
        s.type_id,
        s.name,
        s.amount,
        s.notes,
        s.created_at,
        s.updated_at,
        u.email as user_email,
        st.name as type_name
        FROM savings s
        JOIN users u ON s.user_id = u.id
        JOIN saving_types st ON s.type_id = st.id
        WHERE 1=1
    `;
    const values = [];

    if (user_id) {
        sql += ' AND s.user_id = ?';
        values.push(user_id);
    }
    if (type_id) {
        sql += ' AND s.type_id = ?';
        values.push(type_id);
    }

    sql += ' ORDER BY s.created_at DESC';

    const [rows] = await db.query(sql, values);
    return rows;
}

/**
 *  Obtener ahorro por ID | Get saving by ID
 */
export async function getSavingById(id) {
    const [rows] = await db.query('SELECT * FROM savings WHERE id = ?', [id]);
    return rows[0];
}
//By @Thesharingan312
/**
 *  Crear un nuevo ahorro | Create a new saving
 */
export async function createSaving({ user_id, type_id, name, amount, notes }) {
    const [result] = await db.query(
        `INSERT INTO savings (user_id, type_id, name, amount, notes) VALUES (?, ?, ?, ?, ?)`,
        [user_id, type_id, name, amount, notes || null]
    );
    return { id: result.insertId, user_id, type_id, name, amount, notes: notes || null };
}

/**
 *  Actualizar un ahorro existente (PUT) | Update an existing saving (PUT)
 */
export async function updateSaving(id, { user_id, type_id, name, amount, notes }) {
    const [result] = await db.query(
        `UPDATE savings SET user_id = ?, type_id = ?, name = ?, amount = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [user_id, type_id, name, amount, notes || null, id]
    );
    return result.affectedRows > 0;
}

/**
 *  Actualizar parcialmente un ahorro (PATCH) | Partially update a saving (PATCH)
 */
export async function patchSaving(id, fields) {
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
        `UPDATE savings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
    );
    return result.affectedRows > 0;
}

/**
 *  Eliminar un ahorro por ID | Delete a saving by ID
 */
export async function deleteSaving(id) {
    const [result] = await db.query('DELETE FROM savings WHERE id = ?', [id]);
    return result.affectedRows > 0;
}