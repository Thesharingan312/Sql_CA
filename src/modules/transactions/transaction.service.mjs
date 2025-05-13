// src/modules/transactions/transaction.service.mjs

import * as transactionDao from './transaction.dao.mjs';

// Get all transactions (optionally filtered by user) | Obtener todas las transacciones (opcionalmente filtradas por usuario)
export async function getAllTransactions(filter) {
  return await transactionDao.getAllTransactions(filter);
}

// Get a transaction by ID | Obtener una transacción por ID
export async function getTransactionById(id) {
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Invalid transaction ID');
  }
  return await transactionDao.getTransactionById(id);
}

// Create a new transaction | Crear una nueva transacción
export async function createTransaction(data) {
  const requiredFields = ['user_id', 'type', 'amount'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  return await transactionDao.createTransaction(data);
}

// Update an existing transaction (PUT or PATCH) | Actualizar una transacción existente (PUT o PATCH)
export async function updateTransaction(id, fields) {
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Invalid transaction ID');
  }
  if (!fields || Object.keys(fields).length === 0) {
    throw new Error('No fields to update');
  }
  return await transactionDao.updateTransaction(id, fields);
}

// Delete a transaction by ID | Eliminar una transacción por ID
export async function deleteTransaction(id) {
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Invalid transaction ID');
  }
  return await transactionDao.deleteTransaction(id);
}
