// src/utils/validation.mjs

/**
 *  @file Módulo de utilidades para la validación de datos.
 *  @module src/utils/validation
 */

import { ERROR_MESSAGES } from '../constants/errorMessages.mjs'; // Importamos los mensajes de error

/**
 *  Función auxiliar para crear un objeto Error consistente con un status HTTP.
 *  @param {string} message - El mensaje de error.
 *  @param {number} status - El código de estado HTTP asociado al error.
 *  @returns {Error} Un objeto Error con la propiedad status.
 */
function createError(message, status) {
    const err = new Error(message);
    err.status = status;
    return err;
}

/**
 *  Valida si un ID es un número entero positivo válido.
 *  @param {number} id - El ID a validar.
 *  @param {string} [errorMessage=ERROR_MESSAGES.INVALID_ID] - Mensaje de error personalizado.
 *  @returns {boolean} - True si el ID es válido.
 *  @throws {Error} Si el ID es inválido (no numérico, no entero, menor o igual a cero).
 */
export function isValidId(id, errorMessage = ERROR_MESSAGES.INVALID_ID) {
    if (id === null || id === undefined) {
        throw createError(errorMessage, 400); // Usar el mensaje genérico de ID inválido para 'requerido'
    }
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parseFloat(id) !== parsedId || parsedId <= 0) {
        throw createError(errorMessage, 400);
    }
    return true;
}

/**
 *  Valida el formato de un email.
 *  @param {string} email - El email a validar.
 *  @param {string} [errorMessage=ERROR_MESSAGES.USER.INVALID_EMAIL_FORMAT] - Mensaje de error personalizado.
 *  @returns {boolean} - True si el email tiene un formato válido.
 *  @throws {Error} Si el email tiene un formato inválido.
 */
export function isValidEmail(email, errorMessage = ERROR_MESSAGES.USER.INVALID_EMAIL_FORMAT) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw createError(errorMessage, 400);
    }
    return true;
}

/**
 *  Valida que un valor sea un número positivo.
 *  @param {number} amount - El valor a validar.
 *  @param {string} [errorMessage=ERROR_MESSAGES.TRANSACTION.INVALID_AMOUNT] - Mensaje de error personalizado.
 *  @returns {boolean} - True si el monto es un número positivo.
 *  @throws {Error} Si el monto es inválido.
 */
export function isValidPositiveNumber(amount, errorMessage = ERROR_MESSAGES.TRANSACTION.INVALID_AMOUNT) {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        throw createError(errorMessage, 400);
    }
    return true;
}

/**
 *  Valida que los campos requeridos estén presentes en un objeto de datos.
 *  @param {object} data - El objeto de datos a validar.
 *  @param {string[]} requiredFields - Un array de nombres de campos requeridos.
 *  @param {string} [entityName='Entidad'] - El nombre de la entidad para el mensaje de error.
 *  @returns {boolean} - True si todos los campos requeridos están presentes.
 *  @throws {Error} Si falta algún campo requerido.
 */
export function validateRequiredFields(data, requiredFields, entityName = 'Entidad') {
    if (!data || typeof data !== 'object') {
        throw createError(`${entityName} requiere datos válidos.`, 400); // Este mensaje puede ser más genérico
    }

    for (const field of requiredFields) {
        if (
        !Object.hasOwn(data, field) ||
        data[field] === null ||
        data[field] === undefined ||
        (typeof data[field] === 'string' && data[field].trim() === '')
        ) {
            throw createError(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, 400); // Usar un mensaje estandarizado para campos requeridos
        }
    }
    return true;
}

/**
 *  Valida que el año sea un entero válido y el mes esté entre 1 y 12.
 *  @param {number} year - El año a validar.
 *  @param {number} month - El mes a validar.
 *  @param {string} [errorMessage=ERROR_MESSAGES.BAD_REQUEST] - Mensaje de error personalizado.
 *  @returns {boolean} - True si el año y el mes son válidos.
 *  @throws {Error} Si el año o el mes son inválidos.
 */
export function isValidYearMonth(year, month, errorMessage = ERROR_MESSAGES.BAD_REQUEST) {
    // Asegurarse de que year y month sean números antes de parseInt para evitar NaN en Number.isInteger
    const parsedYear = typeof year === 'number' ? year : parseInt(year, 10);
    const parsedMonth = typeof month === 'number' ? month : parseInt(month, 10);

    if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
        throw createError(errorMessage, 400);
    }
    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        throw createError(errorMessage, 400);
    }
    return true;
}

/**
 *  Valida campos específicos para una actualización parcial de presupuesto (PATCH).
 *  @param {object} fields - Campos a actualizar.
 *  @param {object} existingBudget - El presupuesto existente.
 *  @param {object} daos - Objeto con funciones DAO necesarias (ej. { getUserById, getCategoryById }).
 *  @returns {{year: number, month: number}} - El año y el mes final validados.
 *  @throws {Error} Si alguna validación falla.
 */
export async function validatePatchBudgetFields(fields, existingBudget, daos) { // Ya no necesita ERROR_MESSAGES como parámetro
    const { getUserById, getCategoryById } = daos;

    if (fields.user_id !== undefined) {
        isValidId(fields.user_id, ERROR_MESSAGES.USER.INVALID_ID);
        const userExists = await getUserById(fields.user_id);
        if (!userExists) {
        throw createError(ERROR_MESSAGES.FOREIGN_KEY.USER_NOT_EXIST, 400);
        }
    }

    if (fields.category_id !== undefined) {
        isValidId(fields.category_id, ERROR_MESSAGES.CATEGORY.NOT_FOUND); // Aquí usamos NOT_FOUND, pero quizás FOREIGN_KEY.CATEGORY_NOT_EXIST
        const categoryExists = await getCategoryById(fields.category_id);
        if (!categoryExists) {
        throw createError(ERROR_MESSAGES.FOREIGN_KEY.CATEGORY_NOT_EXIST, 400);
        }
    }

    if (fields.total_amount !== undefined) {
        isValidPositiveNumber(fields.total_amount, ERROR_MESSAGES.TRANSACTION.INVALID_AMOUNT); // Reutilizamos el mensaje de monto
    }

    const year = fields.year !== undefined ? fields.year : existingBudget.year;
    const month = fields.month !== undefined ? fields.month : existingBudget.month;

    if (fields.year !== undefined || fields.month !== undefined) {
        isValidYearMonth(year, month, ERROR_MESSAGES.BAD_REQUEST);
    }

    return { year, month };
}

// Exportar createError para su uso en los servicios
export { createError };