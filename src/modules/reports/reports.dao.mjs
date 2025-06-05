// src/modules/reports/reports.dao.mjs

import db from '../../db/DBHelper.mjs';

// IDs para tipos de transacción (Idealmente, estos vendrían de una configuración o consulta inicial)
const TRANSACTION_TYPE_INGRESO_ID = 1; // Asume que 1 es 'Ingreso'
const TRANSACTION_TYPE_GASTO_ID = 2;   // Asume que 2 es 'Gasto'

/**
 *  Obtiene los datos de ingresos y gastos para un usuario en un rango de fechas.
 *  @param {number} userId - El ID del usuario.
 *  @param {string} [fromDate] - Fecha de inicio (YYYY-MM-DD HH:MM:SS). Opcional.
 *  @param {string} [toDate] - Fecha de fin (YYYY-MM-DD HH:MM:SS). Opcional.
 *  @returns {Promise<{total_ingresos: number, total_gastos: number}>}
 */
export async function getBalanceData(userId, fromDate, toDate) {
    let ingresosSql = `
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE user_id = ? AND type_id = ?`;
    const ingresosParams = [userId, TRANSACTION_TYPE_INGRESO_ID];

    let gastosSql = `
        SELECT COALESCE(SUM(amount), 0) as total
        FROM transactions
        WHERE user_id = ? AND type_id = ?`;
    const gastosParams = [userId, TRANSACTION_TYPE_GASTO_ID];

    if (fromDate) {
        ingresosSql += ' AND created_at >= ?';
        gastosSql += ' AND created_at >= ?';
        ingresosParams.push(fromDate);
        gastosParams.push(fromDate);
    }
    if (toDate) {
        ingresosSql += ' AND created_at <= ?';
        gastosSql += ' AND created_at <= ?';
        ingresosParams.push(toDate);
        gastosParams.push(toDate);
    }

    const [[ingresosResult]] = await db.query(ingresosSql, ingresosParams);
    const [[gastosResult]] = await db.query(gastosSql, gastosParams);

    return {
        total_ingresos: parseFloat(ingresosResult.total) || 0,
        total_gastos: parseFloat(gastosResult.total) || 0
    };
}

/**
 *  Obtiene los gastos agrupados por categoría para un usuario en un rango de fechas.
 *  @param {number} userId - El ID del usuario.
 *  @param {string} [fromDate] - Fecha de inicio (YYYY-MM-DD HH:MM:SS). Opcional.
 *  @param {string} [toDate] - Fecha de fin (YYYY-MM-DD HH:MM:SS). Opcional.
 *  @returns {Promise<Array<{category_id: number, category_name: string, total_spent: number}>>}
 */
export async function getExpensesByCategoryData(userId, fromDate, toDate) {
    let sql = `
        SELECT 
            c.id as category_id,
            c.name as category_name, 
            COALESCE(SUM(t.amount), 0) as total_spent
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ? AND t.type_id = ?`;
    const params = [userId, TRANSACTION_TYPE_GASTO_ID];

    if (fromDate) {
        sql += ' AND t.created_at >= ?';
        params.push(fromDate);
    }
    if (toDate) {
        sql += ' AND t.created_at <= ?';
        params.push(toDate);
    }

    sql += ' GROUP BY c.id, c.name ORDER BY total_spent DESC';

    const [rows] = await db.query(sql, params);
    return rows.map(row => ({
        ...row,
        total_spent: parseFloat(row.total_spent) || 0
    }));
}

// --- Implementaciones para otros reportes (esqueleto) ---

/**
 *  Obtiene los gastos mensuales de un usuario para un rango de fechas.
 *  @param {number} userId
 *  @param {string} fromDate - YYYY-MM-DD
 *  @param {string} toDate - YYYY-MM-DD
 *  @returns {Promise<Array<{year_month: string, total_spent: number}>>}
 */
export async function getMonthlyExpensesData(userId, fromDate, toDate) {
    const sql = `
        SELECT 
            DATE_FORMAT(t.created_at, '%Y-%m') as year_month,
            COALESCE(SUM(t.amount), 0) as total_spent
        FROM transactions t
        WHERE t.user_id = ? AND t.type_id = ? AND t.created_at BETWEEN ? AND ?
        GROUP BY year_month
        ORDER BY year_month ASC;
    `;
    const params = [userId, TRANSACTION_TYPE_GASTO_ID, fromDate, toDate];
    const [rows] = await db.query(sql, params);
    return rows.map(row => ({
        ...row,
        total_spent: parseFloat(row.total_spent) || 0
    }));
}

/**
 *  Obtiene ingresos, gastos y balance por período.
 *  @param {number} userId
 *  @param {string} periodType - 'monthly', 'weekly', 'yearly'
 *  @param {string} fromDate
 *  @param {string} toDate
 *  @returns {Promise<Array<{period_label: string, total_income: number, total_expenses: number}>>}
 */
export async function getPeriodicBalanceData(userId, periodType, fromDate, toDate) {
    let periodFormat;
    switch (periodType) {
        case 'weekly':
            periodFormat = `CONCAT(YEAR(created_at), '-W', LPAD(WEEK(created_at, 1), 2, '0'))`; // ISO 8601 week
            break;
        case 'yearly':
            periodFormat = `YEAR(created_at)`;
            break;
        case 'monthly':
        default:
            periodFormat = `DATE_FORMAT(created_at, '%Y-%m')`;
            break;
    }

    const sql = `
        SELECT
            ${periodFormat} as period_label,
            COALESCE(SUM(CASE WHEN type_id = ? THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN type_id = ? THEN amount ELSE 0 END), 0) as total_expenses
        FROM transactions
        WHERE user_id = ? AND created_at BETWEEN ? AND ?
        GROUP BY period_label
        ORDER BY period_label ASC;
    `;
    const params = [TRANSACTION_TYPE_INGRESO_ID, TRANSACTION_TYPE_GASTO_ID, userId, fromDate, toDate];
    const [rows] = await db.query(sql, params);
    return rows.map(row => ({
        ...row,
        total_income: parseFloat(row.total_income) || 0,
        total_expenses: parseFloat(row.total_expenses) || 0,
    }));
}

/**
 *  Obtiene datos para el reporte de patrones de gasto (gastos por categoría en un período).
 *  Reutiliza getExpensesByCategoryData.
 */
export async function getSpendingPatternsCategoryData(userId, fromDate, toDate) {
    return getExpensesByCategoryData(userId, fromDate, toDate);
}


/**
 *  Obtiene gastos históricos por categoría y mes para el pronóstico.
 *  @param {number} userId
 *  @param {string} fromDate
 *  @param {string} toDate
 *  @returns {Promise<Array<{category_id: number, category_name: string, year_month: string, total_spent: number}>>}
 */
export async function getForecastPastExpensesData(userId, fromDate, toDate) {
    const sql = `
        SELECT
            c.id as category_id,
            c.name as category_name,
            DATE_FORMAT(t.created_at, '%Y-%m') as year_month,
            COALESCE(SUM(t.amount), 0) as total_spent
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ? AND t.type_id = ? AND t.created_at BETWEEN ? AND ?
        GROUP BY c.id, c.name, year_month
        ORDER BY year_month ASC, category_name ASC;
    `;
    const params = [userId, TRANSACTION_TYPE_GASTO_ID, fromDate, toDate];
    const [rows] = await db.query(sql, params);
    return rows.map(row => ({
        ...row,
        total_spent: parseFloat(row.total_spent) || 0
    }));
}

//by @Thesharingan312 Nota: getTopCategoriesData puede usar getExpensesByCategoryData y luego el servicio aplicará el límite.