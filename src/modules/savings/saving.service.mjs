// src/modules/savings/saving.service.mjs

import * as savingDao from './saving.dao.mjs';
import * as userDao from '../users/user.dao.mjs'; 
import * as savingTypeDao from '../savings_types/saving_type.dao.mjs'; 
import { isValidId, isValidPositiveNumber, validateRequiredFields, createError } from '../../utils/validation.mjs';
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs';

/**
 *  Obtener todos los ahorros con filtros | Get all savings with filters
 */
export async function getAllSavings(filter) {
    if (filter.user_id) {
        isValidId(filter.user_id, ERROR_MESSAGES.USER.INVALID_ID);
    }
    if (filter.type_id) {
        isValidId(filter.type_id, ERROR_MESSAGES.SAVING_TYPE.NOT_FOUND); 
    }
    return await savingDao.getAllSavings(filter);
}

/**
 *  Obtener un ahorro por ID | Get a saving by ID
 */
export async function getSavingById(id) {
    isValidId(id, ERROR_MESSAGES.INVALID_ID);
    const saving = await savingDao.getSavingById(id);
    if (!saving) {
        throw createError(ERROR_MESSAGES.SAVING.NOT_FOUND, 404);
    }
    return saving;
}

/**
 *  Crear un nuevo ahorro | Create a new saving
 */
export async function createSaving(savingData) {
    // Eliminada la desestructuración de 'name' ya que no se usa directamente aquí.
    // 'name' sigue estando en savingData y se pasa al DAO.
    const { user_id, type_id, amount } = savingData; 

    validateRequiredFields(savingData, ['user_id', 'type_id', 'name', 'amount'], 'Saving');

    isValidId(user_id, ERROR_MESSAGES.USER.INVALID_ID);
    isValidId(type_id, ERROR_MESSAGES.SAVING_TYPE.NOT_FOUND);
    isValidPositiveNumber(amount, ERROR_MESSAGES.SAVING.INVALID_AMOUNT);

    const userExists = await userDao.getUserById(user_id);
    if (!userExists) {
        throw createError(ERROR_MESSAGES.FOREIGN_KEY.USER_NOT_EXIST, 400);
    }

    const savingTypeExists = await savingTypeDao.getSavingTypeById(type_id);
    if (!savingTypeExists) {
        throw createError(ERROR_MESSAGES.FOREIGN_KEY.SAVING_TYPE_NOT_EXIST, 400);
    }

    return await savingDao.createSaving(savingData);
}

/**
 *  Actualizar un ahorro existente (PUT) | Update an existing saving (PUT)
 */
export async function updateSaving(id, savingData) {
    isValidId(id, ERROR_MESSAGES.INVALID_ID);
    const { user_id, type_id, amount } = savingData; 

    validateRequiredFields(savingData, ['user_id', 'type_id', 'name', 'amount'], 'Saving');

    isValidId(user_id, ERROR_MESSAGES.USER.INVALID_ID);
    isValidId(type_id, ERROR_MESSAGES.SAVING_TYPE.NOT_FOUND);
    isValidPositiveNumber(amount, ERROR_MESSAGES.SAVING.INVALID_AMOUNT);

    const existingSaving = await savingDao.getSavingById(id);
    if (!existingSaving) {
        throw createError(ERROR_MESSAGES.SAVING.NOT_FOUND, 404);
    }

    const userExists = await userDao.getUserById(user_id);
    if (!userExists) {
        throw createError(ERROR_MESSAGES.FOREIGN_KEY.USER_NOT_EXIST, 400);
    }

    const savingTypeExists = await savingTypeDao.getSavingTypeById(type_id);
    if (!savingTypeExists) {
        throw createError(ERROR_MESSAGES.FOREIGN_KEY.SAVING_TYPE_NOT_EXIST, 400);
    }

    const updated = await savingDao.updateSaving(id, savingData);
    if (!updated) {
        throw createError(ERROR_MESSAGES.BAD_REQUEST + " (Failed to update saving or no changes made)", 400);
    }
    return updated;
}

/**
 *  Actualizar parcialmente un ahorro (PATCH) | Partially update a saving (PATCH)
 */
export async function patchSaving(id, fields) {
    isValidId(id, ERROR_MESSAGES.INVALID_ID);

    if (!fields || Object.keys(fields).length === 0) {
        throw createError(ERROR_MESSAGES.NO_FIELDS_TO_UPDATE, 400);
    }

    const existingSaving = await savingDao.getSavingById(id);
    if (!existingSaving) {
        throw createError(ERROR_MESSAGES.SAVING.NOT_FOUND, 404);
    }

    if (fields.user_id !== undefined) {
        isValidId(fields.user_id, ERROR_MESSAGES.USER.INVALID_ID);
        const userExists = await userDao.getUserById(fields.user_id);
        if (!userExists) {
        throw createError(ERROR_MESSAGES.FOREIGN_KEY.USER_NOT_EXIST, 400);
        }
    }

    if (fields.type_id !== undefined) {
        isValidId(fields.type_id, ERROR_MESSAGES.SAVING_TYPE.NOT_FOUND);
        const savingTypeExists = await savingTypeDao.getSavingTypeById(fields.type_id);
        if (!savingTypeExists) {
        throw createError(ERROR_MESSAGES.FOREIGN_KEY.SAVING_TYPE_NOT_EXIST, 400);
        }
    }

    if (fields.amount !== undefined) {
        isValidPositiveNumber(fields.amount, ERROR_MESSAGES.SAVING.INVALID_AMOUNT);
    }

    // No hay validación de unicidad para 'name' en PATCH, por la misma razón que en CREATE.

    const updated = await savingDao.patchSaving(id, fields);
    if (!updated) {
        throw createError(ERROR_MESSAGES.NOT_FOUND, 404); // Podría ser SAVING.NOT_FOUND si el DAO no encontró el ID
    }
    return updated;
}

/**
 *  Eliminar un ahorro por ID | Delete a saving by ID
 */
export async function deleteSaving(id) {
    isValidId(id, ERROR_MESSAGES.INVALID_ID);
    const deleted = await savingDao.deleteSaving(id);
    if (!deleted) {
        throw createError(ERROR_MESSAGES.SAVING.NOT_FOUND, 404);
    }
    return deleted;
}