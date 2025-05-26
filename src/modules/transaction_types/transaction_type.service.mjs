// src/modules/transaction_types/transaction_type.service.mjs

import * as transactionTypeDao from './transaction_type.dao.mjs';
import * as transactionDao from '../transactions/transaction.dao.mjs';
import { isValidId, validateRequiredFields } from '../../utils/validation.mjs'; 
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs'; 

/**
 * Obtener todos los tipos de transacción | Get all transaction types
 */
export async function getAllTransactionTypes() {
    return await transactionTypeDao.getAllTransactionTypes();
}

/**
 * Obtener un tipo de transacción por ID | Get a transaction type by ID
 */
export async function getTransactionTypeById(id) {
    isValidId(id, 'Transaction Type ID'); // MODIFICADO
    const type = await transactionTypeDao.getTransactionTypeById(id);
    if (!type) {
        const error = new Error(ERROR_MESSAGES.TRANSACTION_TYPE.NOT_FOUND); // MODIFICADO
        error.status = 404;
        throw error;
    }
    return type;
}

/**
 * Crear un nuevo tipo de transacción | Create a new transaction type
 */
export async function createTransactionType(typeData) {
    // MODIFICADO: Usar validateRequiredFields para el nombre
    validateRequiredFields(typeData, ['name'], 'Transaction type'); 
    // La función validateRequiredFields ya valida que no sea solo espacios en blanco.

    const existingType = await transactionTypeDao.getTransactionTypeByName(typeData.name);
    if (existingType) {
        const error = new Error(ERROR_MESSAGES.TRANSACTION_TYPE.ALREADY_EXISTS); // MODIFICADO
        error.status = 409; 
        throw error;
    }

    return await transactionTypeDao.createTransactionType(typeData);
}

/**
 * Actualizar un tipo de transacción existente | Update an existing transaction type
 */
export async function updateTransactionType(id, typeData) {
    isValidId(id, 'Transaction Type ID'); // MODIFICADO
    
    // MODIFICADO: Usar validateRequiredFields para el nombre
    validateRequiredFields(typeData, ['name'], 'Transaction type');

    // Verificar si el tipo de transacción existe antes de intentar actualizar
    const typeExists = await transactionTypeDao.getTransactionTypeById(id);
    if (!typeExists) {
        const error = new Error(ERROR_MESSAGES.TRANSACTION_TYPE.NOT_FOUND); // MODIFICADO
        error.status = 404;
        throw error;
    }

    const existingTypeByName = await transactionTypeDao.getTransactionTypeByName(typeData.name);
    if (existingTypeByName && existingTypeByName.id != id) {
        const error = new Error(ERROR_MESSAGES.TRANSACTION_TYPE.ALREADY_EXISTS); // MODIFICADO
        error.status = 409; 
        throw error;
    }

    const updatedCount = await transactionTypeDao.updateTransactionType(id, typeData);
    // Asumiendo que updateTransactionType devuelve el número de filas afectadas o el objeto actualizado
    // Si devuelve 0 filas afectadas y no es porque los datos son idénticos, podría ser un error o no encontrado.
    if (!updatedCount) { 
        // Si typeExists aseguró que existe, y aún así no se actualiza,
        // puede ser que no hubo cambios o un error genérico.
        const error = new Error(ERROR_MESSAGES.BAD_REQUEST + " (Failed to update or no changes made)"); // MODIFICADO
        error.status = 400; 
        throw error;
    }
    return { id, ...typeData }; 
}

/**
 * Eliminar un tipo de transacción por ID | Delete a transaction type by ID
 */
export async function deleteTransactionType(id) {
    isValidId(id, 'Transaction Type ID'); // MODIFICADO

    const transactionsWithType = await transactionDao.getTransactionsByTypeId(id); 
    if (transactionsWithType && transactionsWithType.length > 0) {
        const error = new Error(ERROR_MESSAGES.TRANSACTION_TYPE.ASSOCIATED_TRANSACTIONS_EXIST); // MODIFICADO
        error.status = 409;
        throw error;
    }

    const deletedCount = await transactionTypeDao.deleteTransactionType(id);
    if (!deletedCount) { // Asumiendo que devuelve el número de filas afectadas
        const error = new Error(ERROR_MESSAGES.TRANSACTION_TYPE.NOT_FOUND); // MODIFICADO
        error.status = 404;
        throw error;
    }
    return { message: "Transaction type deleted successfully." }; // O un objeto más significativo
}