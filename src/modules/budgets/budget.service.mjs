// src/modules/budgets/budget.service.mjs

import * as budgetDao from './budget.dao.mjs';
import * as userDao from '../users/user.dao.mjs';
import * as categoryDao from '../categories/category.dao.mjs';
// Importamos directamente las funciones de validación y createError
import {
    isValidId,
    isValidPositiveNumber,
    validateRequiredFields,
    isValidYearMonth,
    validatePatchBudgetFields, // La nueva función
    createError // Para crear errores directamente si la validación no es centralizada en una función
} from '../../utils/validation.mjs';
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs';

/**
 * Obtener todos los presupuestos con filtros | Get all budgets with filters
 */
export async function getAllBudgets(filter) {
    // Validación de filtros usando funciones de validación centralizadas
    if (filter.user_id) {
        isValidId(filter.user_id, ERROR_MESSAGES.USER.INVALID_ID); // Llamada directa, el error se lanza desde isValidId
    }
    if (filter.category_id) {
        isValidId(filter.category_id, ERROR_MESSAGES.CATEGORY.NOT_FOUND); //
    }
    // isVaidYearMonth ahora maneja si year o month son undefined/null también, por lo que no necesita un if anidado
    if (filter.year || filter.month) {
        isValidYearMonth(filter.year, filter.month, ERROR_MESSAGES.BAD_REQUEST);
    }

    return await budgetDao.getAllBudgets(filter);
}

/**
 *  Obtener un presupuesto por ID | Get a budget by ID
 */
export async function getBudgetById(id) {
    isValidId(id, ERROR_MESSAGES.INVALID_ID); //
    const budget = await budgetDao.getBudgetById(id);
    if (!budget) {
        throw createError(ERROR_MESSAGES.BUDGET.NOT_FOUND, 404); // Usar createError
    }
    return budget;
}

/**
 *  Crear un nuevo presupuesto | Create a new budget
 */
export async function createBudget(budgetData) {
    const { user_id, category_id, year, month, total_amount } = budgetData;

    // Validar campos requeridos usando la función centralizada
    // validateRequiredFields ya lanzará un error si faltan campos.
    validateRequiredFields(budgetData, ['user_id', 'category_id', 'year', 'month', 'total_amount'], 'Presupuesto');

    // Validaciones de tipo y valor usando funciones centralizadas
    isValidId(user_id, ERROR_MESSAGES.USER.INVALID_ID);
    isValidId(category_id, ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    isValidYearMonth(year, month, ERROR_MESSAGES.BAD_REQUEST); // isValidYearMonth lanza un error específico.
    isValidPositiveNumber(total_amount, ERROR_MESSAGES.TRANSACTION.INVALID_AMOUNT);

    // Validar existencia de user_id (Abstracción de Validaciones de Existencia de Foráneas)
    const userExists = await userDao.getUserById(user_id);
    if (!userExists) {
        throw createError(ERROR_MESSAGES.FOREIGN_KEY.USER_NOT_EXIST, 400); //
    }

    // Validar existencia de category_id (Abstracción de Validaciones de Existencia de Foráneas)
    const categoryExists = await categoryDao.getCategoryById(category_id);
    if (!categoryExists) {
        throw createError(ERROR_MESSAGES.FOREIGN_KEY.CATEGORY_NOT_EXIST, 400); //
    }

    // Validar que no exista un presupuesto duplicado para el mismo usuario, categoría, año y mes
    const existingBudget = await budgetDao.getExistingBudgetForPeriod(
        user_id,
        category_id,
        year,
        month
    );
    if (existingBudget) {
        throw createError(ERROR_MESSAGES.BUDGET.ALREADY_EXISTS, 409); //
    }

    return await budgetDao.createBudget(budgetData);
    }

    /**
     *  Actualizar un presupuesto existente (PUT) | Update an existing budget (PUT)
     */
    export async function updateBudget(id, budgetData) {
    isValidId(id, ERROR_MESSAGES.INVALID_ID);

    const { user_id, category_id, year, month, total_amount } = budgetData;

    // Validar campos requeridos para PUT
    validateRequiredFields(budgetData, ['user_id', 'category_id', 'year', 'month', 'total_amount'], 'Presupuesto');

    // Validaciones de tipo y valor
    isValidId(user_id, ERROR_MESSAGES.USER.INVALID_ID);
    isValidId(category_id, ERROR_MESSAGES.CATEGORY.NOT_FOUND);
    isValidYearMonth(year, month, ERROR_MESSAGES.BAD_REQUEST);
    isValidPositiveNumber(total_amount, ERROR_MESSAGES.TRANSACTION.INVALID_AMOUNT);

    // Verificar si el presupuesto existe
    const existingBudget = await budgetDao.getBudgetById(id);
    if (!existingBudget) {
        throw createError(ERROR_MESSAGES.BUDGET.NOT_FOUND, 404); //
    }

    // Validar existencia de user_id
    const userExists = await userDao.getUserById(user_id);
    if (!userExists) {
        throw createError(ERROR_MESSAGES.FOREIGN_KEY.USER_NOT_EXIST, 400); //
    }

    // Validar existencia de category_id
    const categoryExists = await categoryDao.getCategoryById(category_id);
    if (!categoryExists) {
        throw createError(ERROR_MESSAGES.FOREIGN_KEY.CATEGORY_NOT_EXIST, 400); //
    }

    // Validar que no exista un presupuesto duplicado para el mismo usuario, categoría, año y mes (excluyendo el actual)
    const duplicateBudget = await budgetDao.getExistingBudgetForPeriod(
        user_id,
        category_id,
        year,
        month,
        id
    );
    if (duplicateBudget) {
        throw createError(ERROR_MESSAGES.BUDGET.ALREADY_EXISTS, 409); //
    }

    const updated = await budgetDao.updateBudget(id, budgetData);
    if (!updated) {
    // Si el DAO no encontró el ID para actualizar, es 404, pero el servicio ya lo verificó.
    // Esto podría indicar que no hubo cambios o un error de DB no cubierto.
    throw createError(ERROR_MESSAGES.BAD_REQUEST, 400);
    }
    return updated;
}

/**
 *  Actualizar parcialmente un presupuesto (PATCH) | Partially update a budget (PATCH)
 */
export async function patchBudget(id, fields) {
    isValidId(id, ERROR_MESSAGES.INVALID_ID);

    if (!fields || Object.keys(fields).length === 0) {
        throw createError(ERROR_MESSAGES.NO_FIELDS_TO_UPDATE, 400); //
    }

    // Verificar si el presupuesto existe
    const existingBudget = await budgetDao.getBudgetById(id);
    if (!existingBudget) {
        throw createError(ERROR_MESSAGES.BUDGET.NOT_FOUND, 404); //
    }

    // Delegar la validación de campos específicos a la función centralizada
    const { year: finalYear, month: finalMonth } = await validatePatchBudgetFields(
    fields,
    existingBudget,
    {
        getUserById: userDao.getUserById, // Pasamos las funciones DAO necesarias
        getCategoryById: categoryDao.getCategoryById
    }
    );

    // Validar que no exista un presupuesto duplicado (si los campos relevantes cambian)
    const finalUserId = fields.user_id !== undefined ? fields.user_id : existingBudget.user_id;
    const finalCategoryId = fields.category_id !== undefined ? fields.category_id : existingBudget.category_id;

    // Solo verificar duplicados si los campos relevantes (user_id, category_id, year, month) han cambiado
    if (finalUserId !== existingBudget.user_id || finalCategoryId !== existingBudget.category_id ||
        finalYear !== existingBudget.year || finalMonth !== existingBudget.month) {
        const duplicateBudget = await budgetDao.getExistingBudgetForPeriod(
        finalUserId,
        finalCategoryId,
        finalYear,
        finalMonth,
        id
        );
        if (duplicateBudget) {
        throw createError(ERROR_MESSAGES.BUDGET.ALREADY_EXISTS, 409); //
        }
    }

    const updated = await budgetDao.patchBudget(id, fields);
    if (!updated) {
        throw createError(ERROR_MESSAGES.NOT_FOUND, 404); //
    }
    return updated;
}

/**
 * Eliminar un presupuesto por ID | Delete a budget by ID
 */
export async function deleteBudget(id) {
    isValidId(id, ERROR_MESSAGES.INVALID_ID);
    const deleted = await budgetDao.deleteBudget(id);
    if (!deleted) {
        throw createError(ERROR_MESSAGES.BUDGET.NOT_FOUND, 404); //
    }
    return deleted;
}