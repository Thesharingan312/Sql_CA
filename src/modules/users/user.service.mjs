// src/modules/users/user.service.mjs

import * as userDao from './user.dao.mjs';

/**
 * Obtener todos los usuarios | Get all users
 */
export async function getAllUsers() {
  // Aquí podrías agregar lógica de negocio extra si lo necesitas
  return await userDao.getAllUsers();
}

/**
 * Obtener usuario por ID | Get user by ID
 */
export async function getUserById(id) {
  // Validación básica: ID debe ser un número positivo
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Invalid user ID');
  }
  return await userDao.getUserById(id);
}

/**
 * Crear un nuevo usuario | Create a new user
 */
export async function createUser(userData) {
  // Validación básica de campos obligatorios
  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  // Aquí podrías agregar lógica de negocio adicional (por ejemplo, verificar email único)
  return await userDao.createUser(userData);
}

/**
 * Actualizar completamente un usuario | Fully update a user
 */
export async function editUser(id, userData) {
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Invalid user ID');
  }
  // Validación básica de campos obligatorios para PUT
  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  for (const field of requiredFields) {
    if (!userData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  return await userDao.updateUser(id, userData);
}

/**
 * Actualizar parcialmente un usuario | Partially update a user
 */
export async function patchUser(id, fields) {
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Invalid user ID');
  }
  // Validar que al menos un campo venga para actualizar
  if (!fields || Object.keys(fields).length === 0) {
    throw new Error('No fields to update');
  }
  return await userDao.patchUser(id, fields);
}

/**
 * Eliminar un usuario | Delete a user
 */
export async function deleteUser(id) {
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Invalid user ID');
  }
  return await userDao.deleteUser(id);
}
