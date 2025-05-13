// src/modules/transactions/transaction.dao.mjs

import db from '../../db/DBHelper.mjs';

// Get all transactions (optionally filtered by user) | Obtener todas las transacciones (opcionalmente filtradas por usuario)
export async function getAllTransactions({ user_id } = {}) {
  let sql = 'SELECT * FROM transactions';
  let values = [];
  if (user_id) {
    sql += ' WHERE user_id = ?';
    values.push(user_id);
  }
  const [rows] = await db.query(sql, values);
  return rows;
}

// Get a transaction by ID | Obtener una transacción por ID
export async function getTransactionById(id) {
  const [rows] = await db.query('SELECT * FROM transactions WHERE id = ?', [id]);
  return rows[0];
}

// Create a new transaction | Crear una nueva transacción
export async function createTransaction({ user_id, type, amount, category, description }) {
  const [result] = await db.query(
    'INSERT INTO transactions (user_id, type, amount, category, description) VALUES (?, ?, ?, ?, ?)',
    [user_id, type, amount, category || null, description || null]
  );
  return { id: result.insertId, user_id, type, amount, category, description };
}

// Update an existing transaction | Actualizar una transacción existente
export async function updateTransaction(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return false;
  const values = keys.map(key => fields[key]);
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  values.push(id);
  const [result] = await db.query(
    `UPDATE transactions SET ${setClause} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

// Delete a transaction by ID | Eliminar una transacción por ID
export async function deleteTransaction(id) {
  const [result] = await db.query('DELETE FROM transactions WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
