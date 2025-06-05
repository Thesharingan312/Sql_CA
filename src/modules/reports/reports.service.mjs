// src/modules/reports/reports.service.mjs

import * as reportsDao from './reports.dao.mjs';
import { isValidId, createError, isValidISODateString } from '../../utils/validation.mjs'; // Asume que tienes estas funciones
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs';
import { subMonths, format, startOfMonth, endOfMonth, parseISO, isValid: isValidDate } from 'date-fns'; // Para manejo de fechas

/**
 *  Valida los parámetros de fecha comunes para los reportes.
 *  @param {object} filters - Objeto con from_date y to_date.
 *  @returns {{fromDate: string|null, toDate: string|null}} Fechas validadas o null.
 */
function validateAndFormatDateFilters(filters = {}) {
    let { from_date, to_date } = filters;

    if (from_date) {
        isValidISODateString(from_date, 'Formato de from_date inválido.'); // Asume YYYY-MM-DDTHH:MM:SS.SSSZ
        if (!isValidDate(parseISO(from_date))) throw createError('from_date no es una fecha válida.', 400);
    } else {
        from_date = null; // O un default, ej: inicio de los tiempos o hace N meses
    }

    if (to_date) {
        isValidISODateString(to_date, 'Formato de to_date inválido.');
        if (!isValidDate(parseISO(to_date))) throw createError('to_date no es una fecha válida.', 400);
    } else {
        to_date = null; // O un default, ej: ahora
    }

    if (from_date && to_date && parseISO(from_date) > parseISO(to_date)) {
        throw createError('from_date no puede ser posterior a to_date.', 400);
    }
    return { fromDate: from_date, toDate: to_date };
}


/**
 *  Genera el reporte de balance (ingresos, gastos, balance total).
 *  @param {number} userId - El ID del usuario.
 *  @param {object} filters - Opciones de filtro (fromDate, toDate).
 *  @returns {Promise<object>}
 */
export async function generateBalanceReport(userId, filters = {}) {
    isValidId(userId, ERROR_MESSAGES.USER.INVALID_ID);
    const { fromDate, toDate } = validateAndFormatDateFilters(filters);

    const { total_ingresos, total_gastos } = await reportsDao.getBalanceData(userId, fromDate, toDate);
    const balance = total_ingresos - total_gastos;

    return {
        user_id: userId,
        from_date: fromDate,
        to_date: toDate,
        total_ingresos: total_ingresos,
        total_gastos: total_gastos,
        balance: balance
    };
}

/**
 *  Genera el reporte de gastos por categoría.
 *  @param {number} userId - El ID del usuario.
 *  @param {object} filters - Opciones de filtro (fromDate, toDate, year, month).
 *  @returns {Promise<object>}
 */
export async function generateExpensesByCategoryReport(userId, filters = {}) {
    isValidId(userId, ERROR_MESSAGES.USER.INVALID_ID);
    
    let { fromDate, toDate } = validateAndFormatDateFilters(filters);
    const { year, month } = filters; // month_year sería 'YYYY-MM'

    if (year && month) { // Si se proveen año y mes, tienen precedencia
        const monthInt = parseInt(month, 10);
        const yearInt = parseInt(year, 10);
        if (isNaN(monthInt) || monthInt < 1 || monthInt > 12 || isNaN(yearInt) || yearInt < 1900 || yearInt > 2200) {
            throw createError('Año o mes inválido.', 400);
        }
        const period = new Date(yearInt, monthInt - 1, 1);
        fromDate = format(startOfMonth(period), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        toDate = format(endOfMonth(period), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    }

    const expenses = await reportsDao.getExpensesByCategoryData(userId, fromDate, toDate);
    return {
        user_id: userId,
        from_date: fromDate,
        to_date: toDate,
        expenses_by_category: expenses
    };
}


// --- Implementaciones para otros reportes (esqueleto) ---

export async function generateMonthlyExpensesReport(userId, filters = {}) {
    isValidId(userId, ERROR_MESSAGES.USER.INVALID_ID);
    const { year } = filters;
    let fromDate, toDate;

    if (year) {
        const yearInt = parseInt(year, 10);
        if (isNaN(yearInt) || yearInt < 1900 || yearInt > 2200) throw createError('Año inválido.', 400);
        fromDate = format(new Date(yearInt, 0, 1), "yyyy-MM-dd'T'00:00:00.000'Z'"); // Inicio del año
        toDate = format(new Date(yearInt, 11, 31), "yyyy-MM-dd'T'23:59:59.999'Z'"); // Fin del año
    } else { // Por defecto, últimos 12 meses incluyendo el actual
        const now = new Date();
        toDate = format(now, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        fromDate = format(startOfMonth(subMonths(now, 11)), "yyyy-MM-dd'T'00:00:00.000'Z'");
    }
    
    const monthlyData = await reportsDao.getMonthlyExpensesData(userId, fromDate, toDate);
    return { user_id: userId, from_date: fromDate, to_date: toDate, monthly_expenses: monthlyData };
}

export async function generatePeriodicBalanceReport(userId, filters = {}) {
    isValidId(userId, ERROR_MESSAGES.USER.INVALID_ID);
    const { period_type = 'monthly', from_date, to_date } = filters; // default a 'monthly'
    const { fromDate: validatedFromDate, toDate: validatedToDate } = validateAndFormatDateFilters({from_date, to_date});

    if (!validatedFromDate || !validatedToDate) {
        throw createError('Se requieren from_date y to_date para el balance periódico.', 400);
    }
    if (!['monthly', 'weekly', 'yearly'].includes(period_type)) {
        throw createError('period_type inválido. Valores permitidos: monthly, weekly, yearly.', 400);
    }

    const periodicData = await reportsDao.getPeriodicBalanceData(userId, period_type, validatedFromDate, validatedToDate);
    const result = periodicData.map(p => ({
        period_label: p.period_label,
        total_income: p.total_income,
        total_expenses: p.total_expenses,
        balance: p.total_income - p.total_expenses
    }));
    return { user_id: userId, period_type, from_date: validatedFromDate, to_date: validatedToDate, periodic_balance: result };
}

export async function generateTopCategoriesReport(userId, filters = {}) {
    isValidId(userId, ERROR_MESSAGES.USER.INVALID_ID);
    const { limit = 5, from_date, to_date, year, month } = filters; // default a top 5
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
        throw createError('El límite debe ser un número positivo.', 400);
    }

    let { fromDate: validatedFromDate, toDate: validatedToDate } = validateAndFormatDateFilters({from_date, to_date});
    if (year && month) {
        const monthInt = parseInt(month, 10);
        const yearInt = parseInt(year, 10);
        if (isNaN(monthInt) || monthInt < 1 || monthInt > 12 || isNaN(yearInt) || yearInt < 1900 || yearInt > 2200) {
            throw createError('Año o mes inválido.', 400);
        }
        const period = new Date(yearInt, monthInt - 1, 1);
        validatedFromDate = format(startOfMonth(period), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        validatedToDate = format(endOfMonth(period), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    }
    
    const expenses = await reportsDao.getExpensesByCategoryData(userId, validatedFromDate, validatedToDate); // DAO ya ordena por DESC
    return { 
        user_id: userId, 
        limit: parsedLimit,
        from_date: validatedFromDate, 
        to_date: validatedToDate, 
        top_categories: expenses.slice(0, parsedLimit) 
    };
}

export async function generateSpendingPatternsReport(userId, filters = {}) {
    isValidId(userId, ERROR_MESSAGES.USER.INVALID_ID);
    const { 
        period1_from_date, period1_to_date, 
        period2_from_date, period2_to_date 
    } = filters;

    if (!period1_from_date || !period1_to_date || !period2_from_date || !period2_to_date) {
        throw createError('Se requieren todas las fechas para los dos períodos (period1_from_date, period1_to_date, period2_from_date, period2_to_date).', 400);
    }

    const p1Dates = validateAndFormatDateFilters({ from_date: period1_from_date, to_date: period1_to_date });
    const p2Dates = validateAndFormatDateFilters({ from_date: period2_from_date, to_date: period2_to_date });

    const expensesP1 = await reportsDao.getExpensesByCategoryData(userId, p1Dates.fromDate, p1Dates.toDate);
    const expensesP2 = await reportsDao.getExpensesByCategoryData(userId, p2Dates.fromDate, p2Dates.toDate);

    const patterns = [];
    const allCategories = new Map();

    expensesP1.forEach(e => {
        if (!allCategories.has(e.category_name)) allCategories.set(e.category_name, { category_name: e.category_name, period1_spent: 0, period2_spent: 0 });
        allCategories.get(e.category_name).period1_spent = e.total_spent;
    });
    expensesP2.forEach(e => {
        if (!allCategories.has(e.category_name)) allCategories.set(e.category_name, { category_name: e.category_name, period1_spent: 0, period2_spent: 0 });
        allCategories.get(e.category_name).period2_spent = e.total_spent;
    });
    
    allCategories.forEach(cat => {
        const change_amount = cat.period2_spent - cat.period1_spent;
        const change_percentage = cat.period1_spent !== 0 ? ((change_amount / cat.period1_spent) * 100) : (cat.period2_spent > 0 ? 100 : 0);
        patterns.push({
            ...cat,
            change_amount: parseFloat(change_amount.toFixed(2)),
            change_percentage: parseFloat(change_percentage.toFixed(2))
        });
    });

    return { 
        user_id: userId, 
        period1: { from_date: p1Dates.fromDate, to_date: p1Dates.toDate },
        period2: { from_date: p2Dates.fromDate, to_date: p2Dates.toDate },
        spending_patterns: patterns.sort((a,b) => Math.abs(b.change_amount) - Math.abs(a.change_amount)) // Ordenar por mayor cambio absoluto
    };
}

export async function generateForecastReport(userId, filters = {}) {
    isValidId(userId, ERROR_MESSAGES.USER.INVALID_ID);
    const { history_months = 3 } = filters; // Por defecto 3 meses de historial
    const numHistoryMonths = parseInt(history_months, 10);
    if (isNaN(numHistoryMonths) || numHistoryMonths <= 0) {
        throw createError('history_months debe ser un número positivo.', 400);
    }

    const now = new Date();
    const toDate = format(endOfMonth(subMonths(now, 1)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"); // Hasta el fin del mes pasado
    const fromDate = format(startOfMonth(subMonths(now, numHistoryMonths)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"); // N meses atrás desde el inicio del mes

    const pastExpenses = await reportsDao.getForecastPastExpensesData(userId, fromDate, toDate);

    const monthlyAverages = new Map();
    pastExpenses.forEach(e => {
        if (!monthlyAverages.has(e.category_id)) {
            monthlyAverages.set(e.category_id, { 
                category_id: e.category_id, 
                category_name: e.category_name, 
                total_spent_history: 0, 
                months_with_spend: 0,
                // Guardar los gastos mensuales para calcular la tendencia si se quisiera (más avanzado)
            });
        }
        const categoryData = monthlyAverages.get(e.category_id);
        categoryData.total_spent_history += e.total_spent;
        // Contar meses distintos en los que hubo gasto para esa categoría
        // Esto es un poco simplificado, una mejor forma sería tener una lista de meses con gasto por categoría
    });

    // Para un conteo más preciso de meses con gasto por categoría:
    const categoryMonthSpend = {};
    pastExpenses.forEach(e => {
        if (!categoryMonthSpend[e.category_id]) {
            categoryMonthSpend[e.category_id] = new Set();
        }
        categoryMonthSpend[e.category_id].add(e.year_month);
    });

    const forecast = [];
    monthlyAverages.forEach(avg => {
        const numMonthsForCategory = categoryMonthSpend[avg.category_id] ? categoryMonthSpend[avg.category_id].size : 0;
        const average_monthly_spending = numMonthsForCategory > 0 ? avg.total_spent_history / numMonthsForCategory : 0;
        forecast.push({
            category_id: avg.category_id,
            category_name: avg.category_name,
            average_monthly_spending: parseFloat(average_monthly_spending.toFixed(2)),
            // Se podría añadir una proyección simple lineal si se guardaron los gastos mensuales
        });
    });
    
    const total_forecasted_spending = forecast.reduce((sum, cat) => sum + cat.average_monthly_spending, 0);

    return { 
        user_id: userId, 
        history_months_used: numHistoryMonths,
        forecast_period: `Próximo mes (basado en historial de ${format(parseISO(fromDate), 'MMM yyyy')} a ${format(parseISO(toDate), 'MMM yyyy')})`,
        forecasted_expenses_by_category: forecast.sort((a,b) => b.average_monthly_spending - a.average_monthly_spending),
        total_forecasted_spending: parseFloat(total_forecasted_spending.toFixed(2))
    };
}