// src/modules/users/user.dao.mjs

import db from '../../db/DBHelper.mjs';

/**
 * Obtener todos los usuarios | Get all users
 */
export async function getAllUsers() {
  const [rows] = await db.query('SELECT * FROM users');
  return rows;
}

/**
 * Obtener usuario por ID | Get user by ID
 */
export async function getUserById(id) {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
}

/**
 * Crear un nuevo usuario | Create a new user
 */
export async function createUser({ first_name, last_name, email, password_hash, profile_id }) {
  const [result] = await db.query(
    'INSERT INTO users (first_name, last_name, email, password_hash, profile_id) VALUES (?, ?, ?, ?, ?)',
    [first_name, last_name, email, password_hash, profile_id || null]
  );
  // Devuelve el usuario creado (sin password) | Return created user (without password)
  return { id: result.insertId, first_name, last_name, email, profile_id };
}

/**
 * Actualizar completamente un usuario | Fully update a user
 */
export async function updateUser(id, { first_name, last_name, email, password_hash, profile_id }) {
  const [result] = await db.query(
    'UPDATE users SET first_name = ?, last_name = ?, email = ?, password_hash = ?, profile_id = ? WHERE id = ?',
    [first_name, last_name, email, password_hash, profile_id || null, id]
  );
  // Devuelve true si se actualizó algún registro | Returns true if any record was updated
  return result.affectedRows > 0;
}

/**
 * Actualizar parcialmente un usuario | Partially update a user
 */
export async function patchUser(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return false;
  const values = keys.map(key => fields[key]);
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  values.push(id);
  const [result] = await db.query(
    `UPDATE users SET ${setClause} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

/**
 * Eliminar un usuario | Delete a user
 */
export async function deleteUser(id) {
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
