// src/modules/categories/category.service.mjs

import * as categoryDao from './category.dao.mjs';
import * as transactionDao from '../transactions/transaction.dao.mjs';

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
    if (!id || isNaN(id) || id <= 0) {
        const error = new Error('Invalid category ID');
        error.status = 400;
        throw error;
    }
    const category = await categoryDao.getCategoryById(id);
        if (!category) {
            const error = new Error('Category not found');
            error.status = 404;
            throw error;
        }
    return category;
}

/**
 * Crear una nueva categoría | Create a new category
 */
export async function createCategory(categoryData) {
    if (!categoryData?.name?.trim()) {
        const error = new Error('Category name is required');
        error.status = 400;
        throw error;
    }

    const existingCategory = await categoryDao.getCategoryByName(categoryData.name);
        if (existingCategory) {
            const error = new Error('Category name already exists');
            error.status = 409; // Conflict
            throw error;
        }

    return await categoryDao.createCategory(categoryData);
}

/**
 * Actualizar una categoría existente | Update an existing category
 */
export async function updateCategory(id, categoryData) {
    if (!id || isNaN(id) || id <= 0) {
        const error = new Error('Invalid category ID');
        error.status = 400;
        throw error;
    }
    if (!categoryData?.name?.trim()) {
        const error = new Error('Category name is required');
        error.status = 400;
        throw error;
    }

    const categoryExists = await categoryDao.getCategoryById(id);
        if (!categoryExists) {
            const error = new Error('Category not found');
            error.status = 404;
            throw error;
        }

    const existingCategory = await categoryDao.getCategoryByName(categoryData.name);
        if (existingCategory && existingCategory.id != id) {
            const error = new Error('Category name already exists');
            error.status = 409; // Conflict
            throw error;
        }

    const updated = await categoryDao.updateCategory(id, categoryData);
        if (!updated) {
            const error = new Error('Failed to update category or no changes made');
            error.status = 400;
            throw error;
        }
        return updated;
}

/**
 * Eliminar una categoría por ID | Delete a category by ID
 */
export async function deleteCategory(id) {
    if (!id || isNaN(id) || id <= 0) {
        const error = new Error('Invalid category ID');
        error.status = 400;
        throw error;
    }

    const transactionsWithCategory = await transactionDao.getTransactionsByCategoryId(id); 
        if (transactionsWithCategory && transactionsWithCategory.length > 0) {
            const error = new Error('Cannot delete category: associated transactions exist');
                error.status = 409;
                throw error;
        } 

    const deleted = await categoryDao.deleteCategory(id);
        if (!deleted) {
            const error = new Error('Category not found');
            error.status = 404;
            throw error;
        }
        return deleted;
}