// src/modules/categories/category.service.mjs

import * as categoryDao from './category.dao.mjs';
import * as transactionDao from '../transactions/transaction.dao.mjs'; 
import { isValidId, validateRequiredFields } from '../../utils/validation.mjs'; 
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs'; 

/**
 * Obtener todas las categorías | Get all categories
 */
export async function getAllCategories() {
    return await categoryDao.getAllCategories();
}

/**
 * Obtener una categoría por ID | Get a category by ID
 */
export async function getCategoryById(id) {
    isValidId(id, 'Category ID'); // MODIFICADO
    const category = await categoryDao.getCategoryById(id);
    if (!category) {
        const error = new Error(ERROR_MESSAGES.CATEGORY.NOT_FOUND); // MODIFICADO
        error.status = 404;
        throw error;
    }
    return category;
}

/**
 * Crear una nueva categoría | Create a new category
 */
export async function createCategory(categoryData) {
    // MODIFICADO: Usar validateRequiredFields
    validateRequiredFields(categoryData, ['name'], 'Category');

    const existingCategory = await categoryDao.getCategoryByName(categoryData.name);
    if (existingCategory) {
        const error = new Error(ERROR_MESSAGES.CATEGORY.ALREADY_EXISTS); // MODIFICADO
        error.status = 409; 
        throw error;
    }

    return await categoryDao.createCategory(categoryData);
}

/**
 * Actualizar una categoría existente | Update an existing category
 */
export async function updateCategory(id, categoryData) {
    isValidId(id, 'Category ID'); // MODIFICADO

    // MODIFICADO: Usar validateRequiredFields
    validateRequiredFields(categoryData, ['name'], 'Category');
    
    const categoryExists = await categoryDao.getCategoryById(id);
    if (!categoryExists) {
        const error = new Error(ERROR_MESSAGES.CATEGORY.NOT_FOUND); // MODIFICADO
        error.status = 404;
        throw error;
    }

    const existingCategoryByName = await categoryDao.getCategoryByName(categoryData.name);
    if (existingCategoryByName && existingCategoryByName.id != id) {
        const error = new Error(ERROR_MESSAGES.CATEGORY.ALREADY_EXISTS); // MODIFICADO
        error.status = 409; 
        throw error;
    }

    const updatedCount = await categoryDao.updateCategory(id, categoryData);
    if (!updatedCount) {
        const error = new Error(ERROR_MESSAGES.BAD_REQUEST + " (Failed to update category or no changes made)"); // MODIFICADO
        error.status = 400; 
        throw error;
    }
    return { id, ...categoryData }; // O recargar: await getCategoryById(id);
}

/**
 * Eliminar una categoría por ID | Delete a category by ID
 */
export async function deleteCategory(id) {
    isValidId(id, 'Category ID'); // MODIFICADO

    const transactionsWithCategory = await transactionDao.getTransactionsByCategoryId(id); 
    if (transactionsWithCategory && transactionsWithCategory.length > 0) {
        const error = new Error(ERROR_MESSAGES.CATEGORY.ASSOCIATED_TRANSACTIONS_EXIST); // MODIFICADO
        error.status = 409;
        throw error;
    } 

    const deletedCount = await categoryDao.deleteCategory(id);
    if (!deletedCount) {
        const error = new Error(ERROR_MESSAGES.CATEGORY.NOT_FOUND); // MODIFICADO
        error.status = 404;
        throw error;
    }
    return { message: "Category deleted successfully." };
}