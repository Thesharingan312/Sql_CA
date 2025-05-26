// src/utils/validation.mjs

/**
 *  @file Módulo de utilidades para la validación de datos.
 *  @module src/utils/validation
 */

/**
 *  Valida si un ID es un número entero positivo válido.
 *  @param {number} id - El ID a validar.
 *  @param {string} [idName='ID'] - El nombre del ID para mensajes de error.
 *  @returns {boolean} - True si el ID es válido.
 *  @throws {Error} Si el ID es inválido (no numérico, no entero, menor o igual a cero).
 */
export function isValidId(id, idName = 'ID') {
    if (id === null || id === undefined) {
        const error = new Error(`${idName} es requerido.`);
        error.status = 400;
        throw error;
    }
    if (isNaN(id) || parseFloat(id) !== parseInt(id, 10) || parseInt(id, 10) <= 0) {
        const error = new Error(`${idName} debe ser un número entero positivo.`);
        error.status = 400;
        throw error;
    }
    return true;
}

/**
 *  Valida el formato de un email.
 *  @param {string} email - El email a validar.
 *  @returns {boolean} - True si el email tiene un formato válido.
 *  @throws {Error} Si el email tiene un formato inválido.
 */
export function isValidEmail(email) {
    // Expresión regular simple para emails válidos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const error = new Error('Formato de email inválido.');
        error.status = 400;
        throw error;
    }
    return true;
}

/**
 *  Valida que un valor sea un número positivo.
 *  @param {number} amount - El valor a validar.
 *  @param {string} [fieldName='Monto'] - El nombre del campo para mensajes de error.
 *  @returns {boolean} - True si el monto es un número positivo.
 *  @throws {Error} Si el monto es inválido.
 */
export function isValidPositiveNumber(amount, fieldName = 'Monto') {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        const error = new Error(`${fieldName} debe ser un número positivo.`);
        error.status = 400;
        throw error;
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
        const error = new Error(`${entityName} requiere datos válidos.`);
        error.status = 400;
        throw error;
    }

    for (const field of requiredFields) {
        if (
            !Object.hasOwn(data, field) ||
            data[field] === null ||
            data[field] === undefined ||
            (typeof data[field] === 'string' && data[field].trim() === '')
        ) {
            const error = new Error(`${entityName} requiere el campo '${field}'.`);
            error.status = 400;
            throw error;
        }
    }
    return true;
}
