// src/modules/transactions/transaction.service.mjs

import * as transactionDao from './transaction.dao.mjs';
import { isValidId, isValidPositiveNumber, validateRequiredFields } from '../../utils/validation.mjs'; 
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs'; 

/**
 * Obtener todas las transacciones con filtros
 */
export async function getAllTransactions(filter) {
  return await transactionDao.getAllTransactions(filter);
}

/**
 * Obtener una transacción por ID
 */
export async function getTransactionById(id) {
  isValidId(id, 'Transaction ID'); // MODIFICADO
  const transaction = await transactionDao.getTransactionById(id);
  if (!transaction) {
    const error = new Error(ERROR_MESSAGES.TRANSACTION.NOT_FOUND); // MODIFICADO
    error.status = 404;
    throw error;
  }
  return transaction;
}

/**
 * Crear una nueva transacción
 */
export async function createTransaction(data) {
  const requiredFields = ['user_id', 'type_id', 'amount']; // category_id se maneja especialmente
  validateRequiredFields(data, requiredFields, 'Transaction'); // MODIFICADO

  // La validación de category_id permanece aquí debido a la lógica de 'Others'
  if (!('category_id' in data) || data.category_id === null || data.category_id === undefined) {
    // Esta lógica de acceso directo a 'db' podría moverse al DAO de categorías.
    // Por ahora, se estandariza el mensaje de error.
    const [rows] = await db.query( // Asegúrate que 'db' esté disponible en este contexto
      'SELECT id FROM categories WHERE name = ? LIMIT 1',
      ['Others']
    );
    if (!rows.length) {
      const error = new Error(ERROR_MESSAGES.CATEGORY.NOT_FOUND + " (Default 'Others')"); // MODIFICADO 
      error.status = 500; // aunque podría ser 404/400
      throw error;
    }
    data.category_id = rows[0].id;
  }
  
  // Validar IDs de FK antes de usarlos
  isValidId(data.user_id, 'User ID');
  isValidId(data.type_id, 'Type ID');
  isValidId(data.category_id, 'Category ID'); // Validar el ID de categoría sea el enviado o el de "Others"

  const userOk = await transactionDao.userExists(data.user_id);
  if (!userOk) {
    const error = new Error(ERROR_MESSAGES.FOREIGN_KEY.USER_NOT_EXIST); // MODIFICADO
    error.status = 400;
    throw error;
  }
  const typeOk = await transactionDao.typeExists(data.type_id);
  if (!typeOk) {
    const error = new Error(ERROR_MESSAGES.FOREIGN_KEY.TRANSACTION_TYPE_NOT_EXIST); // MODIFICADO
    error.status = 400;
    throw error;
  }
  const categoryOk = await transactionDao.categoryExists(data.category_id);
  if (!categoryOk) {
    const error = new Error(ERROR_MESSAGES.FOREIGN_KEY.CATEGORY_NOT_EXIST); // MODIFICADO
    error.status = 400;
    throw error;
  }

  isValidPositiveNumber(data.amount, 'Amount'); // MODIFICADO

  return await transactionDao.createTransaction(data);
}

/**
 * Actualizar una transacción existente (PUT o PATCH)
 */
export async function updateTransaction(id, fields) {
  isValidId(id, 'Transaction ID'); // MODIFICADO

  if (!fields || Object.keys(fields).length === 0) {
    const error = new Error(ERROR_MESSAGES.NO_FIELDS_TO_UPDATE); // MODIFICADO
    error.status = 400;
    throw error;
  }

  if (fields.user_id) {
    isValidId(fields.user_id, 'User ID'); // MODIFICADO: Validar formato del ID
    const userOk = await transactionDao.userExists(fields.user_id);
    if (!userOk) {
      const error = new Error(ERROR_MESSAGES.FOREIGN_KEY.USER_NOT_EXIST); // MODIFICADO
      error.status = 400;
      throw error;
    }
  }
  if (fields.type_id) {
    isValidId(fields.type_id, 'Type ID'); // MODIFICADO: Validar formato del ID
    const typeOk = await transactionDao.typeExists(fields.type_id);
    if (!typeOk) {
      const error = new Error(ERROR_MESSAGES.FOREIGN_KEY.TRANSACTION_TYPE_NOT_EXIST); // MODIFICADO
      error.status = 400;
      throw error;
    }
  }
  if ('category_id' in fields && fields.category_id !== null && fields.category_id !== undefined) {
    isValidId(fields.category_id, 'Category ID'); // MODIFICADO: Validar formato del ID
    const categoryOk = await transactionDao.categoryExists(fields.category_id);
    if (!categoryOk) {
      const error = new Error(ERROR_MESSAGES.FOREIGN_KEY.CATEGORY_NOT_EXIST); // MODIFICADO
      error.status = 400;
      throw error;
    }
  }
  if (fields.amount) {
    isValidPositiveNumber(fields.amount, 'Amount'); // MODIFICADO
  }

  const updated = await transactionDao.updateTransaction(id, fields);
  if (!updated) { // Asumiendo que el DAO devuelve null o 0 si no se actualiza/encuentra
    const error = new Error(ERROR_MESSAGES.TRANSACTION.NOT_FOUND); // MODIFICADO
    error.status = 404;
    throw error;
  }
  return updated;
}

/**
 * Eliminar una transacción por ID
 */
export async function deleteTransaction(id) {
  isValidId(id, 'Transaction ID'); // MODIFICADO
  const deleted = await transactionDao.deleteTransaction(id);
  if (!deleted) { // Asumiendo que el DAO devuelve null o 0 si no se elimina/encuentra
    const error = new Error(ERROR_MESSAGES.TRANSACTION.NOT_FOUND); // MODIFICADO
    error.status = 404;
    throw error;
  }
  return deleted;
}
