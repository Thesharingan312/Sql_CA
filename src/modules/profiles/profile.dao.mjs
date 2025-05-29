// src/modules/profiles/profile.dao.mjs

import db from '../../db/DBHelper.mjs';

/**
 *  Obtener todos los perfiles | Get all profiles
 */
export async function getAllProfiles() {
    const [rows] = await db.query('SELECT * FROM profiles');
    return rows;
}

/**
 *  Obtener perfil por ID | Get profile by ID
 */
export async function getProfileById(id) {
    const [rows] = await db.query('SELECT * FROM profiles WHERE id = ?', [id]);
    return rows[0];
}

/**
 *  Obtener perfil por nombre | Get profile by name
 */
export async function getProfileByName(name) {
    const [rows] = await db.query('SELECT * FROM profiles WHERE name = ?', [name]);
    return rows[0];
}

/**
 *  Crear un nuevo perfil | Create a new profile
 */
export async function createProfile({ name }) {
    const [result] = await db.query(
    'INSERT INTO profiles (name) VALUES (?)',
    [name]
    );
    return { id: result.insertId, name };
}

/**
 *  Actualizar un perfil existente | Update an existing profile
 */
export async function updateProfile(id, { name }) {
    const [result] = await db.query(
    'UPDATE profiles SET name = ? WHERE id = ?',
    [name, id]
    );
    return result.affectedRows > 0;
}
//By @Thesharingan312
/**
 *  Eliminar un perfil por ID | Delete a profile by ID
 */
export async function deleteProfile(id) {
    const [result] = await db.query('DELETE FROM profiles WHERE id = ?', [id]);
    return result.affectedRows > 0;
}