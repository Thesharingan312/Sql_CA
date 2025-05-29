// src/modules/saving_types/saving_type.service.mjs

import * as savingTypeDao from './saving_type.dao.mjs';
import { isValidId, validateRequiredFields, createError } from '../../utils/validation.mjs';
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs';

/**
 *  Obtener todos los tipos de ahorro | Get all saving types
 */
export async function getAllSavingTypes() {
    return await savingTypeDao.getAllSavingTypes();
}

/**
 *  Obtener un tipo de ahorro por ID | Get a saving type by ID
 */
export async function getSavingTypeById(id) {
    isValidId(id, ERROR_MESSAGES.INVALID_ID);
    const type = await savingTypeDao.getSavingTypeById(id);
    if (!type) {
        throw createError(ERROR_MESSAGES.SAVING_TYPE.NOT_FOUND, 404);
    }
    return type;
}

/**
 *  Crear un nuevo tipo de ahorro | Create a new saving type
 */
export async function createSavingType(typeData) {
    validateRequiredFields(typeData, ['name'], 'Saving type');

    const existingType = await savingTypeDao.getSavingTypeByName(typeData.name);
    if (existingType) {
        throw createError(ERROR_MESSAGES.SAVING_TYPE.ALREADY_EXISTS, 409);
    }

    return await savingTypeDao.createSavingType(typeData);
}

/**
 *  Actualizar un tipo de ahorro existente | Update an existing saving type
 */
export async function updateSavingType(id, typeData) {
    isValidId(id, ERROR_MESSAGES.INVALID_ID);
    validateRequiredFields(typeData, ['name'], 'Saving type');

    const typeToUpdate = await savingTypeDao.getSavingTypeById(id);
    if (!typeToUpdate) {
        throw createError(ERROR_MESSAGES.SAVING_TYPE.NOT_FOUND, 404);
    }

    const existingTypeByName = await savingTypeDao.getSavingTypeByName(typeData.name);
    if (existingTypeByName && existingTypeByName.id != id) {
        throw createError(ERROR_MESSAGES.SAVING_TYPE.ALREADY_EXISTS, 409);
    }

    const updatedCount = await savingTypeDao.updateSavingType(id, typeData);
    if (!updatedCount) {
        throw createError(ERROR_MESSAGES.BAD_REQUEST + " (Failed to update saving type or no changes made)", 400);
    }
    return { id, ...typeData };
}

/**
 *  Eliminar un tipo de ahorro por ID | Delete a saving type by ID
 */
export async function deleteSavingType(id) {
    isValidId(id, ERROR_MESSAGES.INVALID_ID);

    // Verificar si hay ahorros asociados a este tipo de ahorro
    const savingsWithType = await savingTypeDao.getSavingsByTypeId(id); 
    if (savingsWithType && savingsWithType.length > 0) {
        throw createError(ERROR_MESSAGES.SAVING_TYPE.ASSOCIATED_SAVINGS_EXIST, 409);
    }

    const deletedCount = await savingTypeDao.deleteSavingType(id);
    if (!deletedCount) {
        throw createError(ERROR_MESSAGES.SAVING_TYPE.NOT_FOUND, 404);
    }
    return { message: "Saving type deleted successfully." };
}