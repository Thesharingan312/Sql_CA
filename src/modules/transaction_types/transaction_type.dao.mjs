// src/modules/transaction_types/transaction_type.dao.mjs

import db from '../../db/DBHelper.mjs';

/**
 *  Obtener todos los tipos de transacción | Get all transaction types
 */
export async function getAllTransactionTypes() {
    const [rows] = await db.query('SELECT * FROM transaction_types');
    return rows;
}

/**
 *  Obtener tipo de transacción por ID | Get transaction type by ID
 */
export async function getTransactionTypeById(id) {
    const [rows] = await db.query('SELECT * FROM transaction_types WHERE id = ?', [id]);
    return rows[0];
}

/**
 *  Obtener tipo de transacción por nombre | Get transaction type by name
 */
export async function getTransactionTypeByName(name) {
    const [rows] = await db.query('SELECT * FROM transaction_types WHERE name = ?', [name]);
    return rows[0];
}

/**
 *  Crear un nuevo tipo de transacción | Create a new transaction type
 */
export async function createTransactionType({ name }) {
    const [result] = await db.query(
        'INSERT INTO transaction_types (name) VALUES (?)',
        [name]
    );
    return { id: result.insertId, name };
}
//By @Thesharingan312
/**
 *  Actualizar un tipo de transacción existente | Update an existing transaction type
 */
export async function updateTransactionType(id, { name }) {
    const [result] = await db.query(
        'UPDATE transaction_types SET name = ? WHERE id = ?',
        [name, id]
    );
    return result.affectedRows > 0;
}

/**
 *  Eliminar un tipo de transacción por ID | Delete a transaction type by ID
 */
export async function deleteTransactionType(id) {
    const [result] = await db.query('DELETE FROM transaction_types WHERE id = ?', [id]);
    return result.affectedRows > 0;
}