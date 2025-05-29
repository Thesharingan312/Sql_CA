// src/modules/saving_types/saving_type.dao.mjs

import db from '../../db/DBHelper.mjs';

/**
 *  Obtener todos los tipos de ahorro | Get all saving types
 */
export async function getAllSavingTypes() {
    const [rows] = await db.query('SELECT id, name FROM saving_types'); 
    return rows;
}

/**
 *  Obtener tipo de ahorro por ID | Get saving type by ID
 */
export async function getSavingTypeById(id) {
    const [rows] = await db.query('SELECT id, name FROM saving_types WHERE id = ?', [id]);
    return rows[0];
}

/**
 *  Obtener tipo de ahorro por nombre | Get saving type by name
 */
export async function getSavingTypeByName(name) {
    const [rows] = await db.query('SELECT id, name FROM saving_types WHERE name = ?', [name]);
    return rows[0];
}
//By @thesharingan312
/**
 *  Crear un nuevo tipo de ahorro | Create a new saving type
 */
export async function createSavingType({ name }) {
    const [result] = await db.query(
        'INSERT INTO saving_types (name) VALUES (?)',
        [name]
    );
    return { id: result.insertId, name };
}

/**
 *  Actualizar un tipo de ahorro existente | Update an existing saving type
 */
export async function updateSavingType(id, { name }) {
    const [result] = await db.query(
        'UPDATE saving_types SET name = ? WHERE id = ?',
        [name, id]
    );
    return result.affectedRows > 0;
}

/**
 *  Eliminar un tipo de ahorro por ID | Delete a saving type by ID
 */
export async function deleteSavingType(id) {
    const [result] = await db.query('DELETE FROM saving_types WHERE id = ?', [id]);
    return result.affectedRows > 0;
}

/**
 *  Verificar si existen ahorros asociados a un tipo de ahorro
 *  Check if there are savings associated with a saving type
 */
export async function getSavingsByTypeId(typeId) {
    const [rows] = await db.query(
        'SELECT id FROM savings WHERE type_id = ? LIMIT 1',
        [typeId]
    );
    return rows;
}