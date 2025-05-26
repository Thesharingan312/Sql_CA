// src/modules/users/user.service.mjs

import * as userDao from './user.dao.mjs';
import { isValidId, isValidEmail, validateRequiredFields } from '../../utils/validation.mjs'; 
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs'; 

/**
 * Filtra campos sensibles de usuario
 */
function omitPassword(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

// ELIMINADO: La función local isValidEmail se elimina, se usará la de validation.mjs

/**
 * Obtener todos los usuarios | Get all users
 */
export async function getAllUsers() {
  const users = await userDao.getAllUsers();
  return users.map(omitPassword);
}

/**
 * Obtener usuario por ID | Get user by ID
 */
export async function getUserById(id) {
  isValidId(id, 'User ID'); // MODIFICADO: Usa la función de validación centralizada
  const user = await userDao.getUserById(id);
  if (!user) { // MODIFICADO: Chequeo explícito y mensaje estandarizado
    const error = new Error(ERROR_MESSAGES.USER.NOT_FOUND);
    error.status = 404;
    throw error;
  }
  return omitPassword(user);
}

/**
 * Crear un nuevo usuario | Create a new user
 */
export async function createUser(userData) {
  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  validateRequiredFields(userData, requiredFields, 'User'); // MODIFICADO: Usa la función de validación centralizada

  isValidEmail(userData.email); // MODIFICADO: Usa la función de validación centralizada

  const existingUserByEmail = await userDao.getUserByEmail(userData.email);
  if (existingUserByEmail) {
    const error = new Error(ERROR_MESSAGES.USER.ALREADY_EXISTS); // MODIFICADO
    error.status = 409; // 409 Conflict es más apropiado
    throw error;
  }

  const profileOk = await userDao.profileExists(userData.profile_id);
  if (!profileOk) {
    const error = new Error(ERROR_MESSAGES.FOREIGN_KEY.PROFILE_NOT_EXIST); // MODIFICADO
    error.status = 400; // O 404 si se considera que el perfil no encontrado es un recurso no encontrado
    throw error;
  }

  if (userData.base_budget === undefined) userData.base_budget = 0;
  if (userData.base_saving === undefined) userData.base_saving = 0;
  const user = await userDao.createUser(userData);
  return omitPassword(user);
}

/**
 * Actualizar completamente un usuario | Fully update a user
 */
export async function editUser(id, userData) {
  isValidId(id, 'User ID'); // MODIFICADO

  const requiredFields = ['first_name', 'last_name', 'email', 'password_hash', 'profile_id'];
  validateRequiredFields(userData, requiredFields, 'User'); // MODIFICADO

  isValidEmail(userData.email); // MODIFICADO

  const existingUserByEmail = await userDao.getUserByEmail(userData.email);
  if (existingUserByEmail && existingUserByEmail.id != id) {
    const error = new Error(ERROR_MESSAGES.USER.ALREADY_EXISTS); // MODIFICADO
    error.status = 409; // 409 Conflict
    throw error;
  }

  const profileOk = await userDao.profileExists(userData.profile_id);
  if (!profileOk) {
    const error = new Error(ERROR_MESSAGES.FOREIGN_KEY.PROFILE_NOT_EXIST); // MODIFICADO
    error.status = 400;
    throw error;
  }

  if (userData.base_budget === undefined) userData.base_budget = 0;
  if (userData.base_saving === undefined) userData.base_saving = 0;
  
  const updatedUser = await userDao.updateUser(id, userData);
  if (!updatedUser) { // Es buena práctica verificar si la actualización tuvo efecto o si el usuario no se encontró
    const error = new Error(ERROR_MESSAGES.USER.NOT_FOUND);
    error.status = 404;
    throw error;
  }
  return omitPassword(updatedUser); // MODIFICADO: omitPassword para consistencia
}

/**
 * Actualizar parcialmente un usuario | Partially update a user
 */
export async function patchUser(id, fields) {
  isValidId(id, 'User ID'); // MODIFICADO

  if (!fields || Object.keys(fields).length === 0) {
    const error = new Error(ERROR_MESSAGES.NO_FIELDS_TO_UPDATE); // MODIFICADO
    error.status = 400;
    throw error;
  }

  if (fields.email) {
    isValidEmail(fields.email); // MODIFICADO
    const existingUserByEmail = await userDao.getUserByEmail(fields.email);
    if (existingUserByEmail && existingUserByEmail.id != id) {
      const error = new Error(ERROR_MESSAGES.USER.ALREADY_EXISTS); // MODIFICADO
      error.status = 409; // 409 Conflict
      throw error;
    }
  }

  if (fields.profile_id) {
    const profileOk = await userDao.profileExists(fields.profile_id);
    if (!profileOk) {
      const error = new Error(ERROR_MESSAGES.FOREIGN_KEY.PROFILE_NOT_EXIST); // MODIFICADO
      error.status = 400;
      throw error;
    }
  }
  
  const patchedUser = await userDao.patchUser(id, fields);
  if (!patchedUser) { // Verificar si la actualización tuvo efecto
    const error = new Error(ERROR_MESSAGES.USER.NOT_FOUND); // O un error más genérico de actualización fallida
    error.status = 404;
    throw error;
  }
  return omitPassword(patchedUser); // MODIFICADO: omitPassword para consistencia
}

/**
 * Eliminar un usuario | Delete a user
 */
export async function deleteUser(id) {
  isValidId(id, 'User ID'); 
    
  const result = await userDao.deleteUser(id);
  if (result == 0) { // Asumiendo que 0 significa que no se encontró o no se borró
      const error = new Error(ERROR_MESSAGES.USER.NOT_FOUND);
      error.status = 404;
      throw error;
  }
  return result; // O un mensaje de éxito
}
