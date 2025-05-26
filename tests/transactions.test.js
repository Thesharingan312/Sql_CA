// tests/transactions.test.js

import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Transactions API (integración completa, extendida)', () => {
  // IDs de prueba - AJUSTA según tus datos reales o crea en el setup
  // Para un entorno de test más aislado, es ideal crear estos datos en un `beforeAll`
  // y eliminarlos en un `afterAll`.
  let validUserId;
  let validTypeId; // Para ingreso
  let validTypeIdExpense; // Para gasto
  let validCategoryId;
  let othersCategoryId;

  let createdTransactionId;
  let createdTransactionId2;
  let createdUserId;
  let createdProfileId;

  // Antes de todos los tests, preparamos datos de prueba y limpiamos
  beforeAll(async () => {
    // Limpiar usuarios y perfiles existentes para asegurar un estado limpio
    await db.query('DELETE FROM transactions');
    await db.query('DELETE FROM users');
    await db.query('DELETE FROM profiles');

    // Crear un perfil para el usuario
    const [profileResult] = await db.query('INSERT INTO profiles (name) VALUES (?)', ['TestProfileForTransactions']);
    createdProfileId = profileResult.insertId;

    // Crear un usuario de prueba
    const [userResult] = await db.query(
      'INSERT INTO users (first_name, last_name, email, password_hash, profile_id, base_budget, base_saving) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Test', 'User', 'test.transactions@example.com', 'hashed_password', createdProfileId, 0, 0]
    );
    createdUserId = userResult.insertId;
    validUserId = createdUserId; // Usar el ID del usuario recién creado

    // Obtener IDs de tipos de transacción (asumiendo que "Income" y "Expense" existen)
    const [types] = await db.query('SELECT id, name FROM transaction_types WHERE name IN ("Income", "Expense")');
    const incomeType = types.find(t => t.name === 'Income');
    const expenseType = types.find(t => t.name === 'Expense');

    if (!incomeType || !expenseType) {
      // Si no existen, créalos
      const [incomeRes] = await db.query('INSERT INTO transaction_types (name) VALUES (?)', ['Income']);
      validTypeId = incomeRes.insertId;
      const [expenseRes] = await db.query('INSERT INTO transaction_types (name) VALUES (?)', ['Expense']);
      validTypeIdExpense = expenseRes.insertId;
    } else {
      validTypeId = incomeType.id;
      validTypeIdExpense = expenseType.id;
    }


    // Obtener o crear la categoría "Others"
    const [othersCategoryRows] = await db.query('SELECT id FROM categories WHERE name = "Others" LIMIT 1');
    if (!othersCategoryRows.length) {
      const [categoryResult] = await db.query('INSERT INTO categories (name) VALUES (?)', ['Others']);
      othersCategoryId = categoryResult.insertId;
    } else {
      othersCategoryId = othersCategoryRows[0].id;
    }

    // Obtener o crear una categoría válida para tests
    const [validCategoryRows] = await db.query('SELECT id FROM categories WHERE name = "Food" LIMIT 1');
    if (!validCategoryRows.length) {
      const [categoryResult] = await db.query('INSERT INTO categories (name) VALUES (?)', ['Food']);
      validCategoryId = categoryResult.insertId;
    } else {
      validCategoryId = validCategoryRows[0].id;
    }

    console.log(`Setup complete: User ID: ${createdUserId}, Profile ID: ${createdProfileId}, Income Type ID: ${validTypeId}, Expense Type ID: ${validTypeIdExpense}, Others Category ID: ${othersCategoryId}, Valid Category ID: ${validCategoryId}`);
  });

  // Limpiar la base de datos después de todos los tests
  afterAll(async () => {
    // Limpiar transacciones, usuarios y perfiles creados en este test
    await db.query('DELETE FROM transactions WHERE user_id = ?', [createdUserId]);
    await db.query('DELETE FROM users WHERE id = ?', [createdUserId]);
    await db.query('DELETE FROM profiles WHERE id = ?', [createdProfileId]);

    // Opcional: limpiar los tipos de transacción y categorías si fueron creados exclusivamente para el test
    // Considera si estos son datos maestros o específicos del test.
    // Por simplicidad, no los eliminaremos aquí a menos que sean un problema para futuros tests.

    await db.end(); // Cerrar la conexión a la base de datos
  });

  // 1. Crear transacción válida con category_id
  it('should create a valid transaction with category_id', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        category_id: validCategoryId,
        amount: 100.50,
        description: 'Compra supermercado'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.user_id).toBe(validUserId);
    expect(res.body.type_id).toBe(validTypeId);
    expect(res.body.category_id).toBe(validCategoryId);
    expect(res.body.amount).toBe(100.50);
    expect(res.body.description).toBe('Compra supermercado');
    createdTransactionId = res.body.id;
  });

  // 2. Crear transacción válida sin category_id (null)
  it('should create a valid transaction without category_id (null)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        category_id: null,
        amount: 50.00,
        description: 'Pago de nómina'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.user_id).toBe(validUserId);
    expect(res.body.type_id).toBe(validTypeId);
    expect(res.body.category_id).toBeNull();
    expect(res.body.amount).toBe(50.00);
    createdTransactionId2 = res.body.id;
  });

  // 3. Crear transacción con user_id inválido
  it('should return 400 for creating a transaction with invalid user_id', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: 999999, // ID de usuario que no existe
        type_id: validTypeId,
        category_id: validCategoryId,
        amount: 10.00,
        description: 'Intento fallido'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'User does not exist');
  });

  // 4. Crear transacción con type_id inválido
  it('should return 400 for creating a transaction with invalid type_id', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: 999999, // ID de tipo de transacción que no existe
        category_id: validCategoryId,
        amount: 10.00,
        description: 'Intento fallido'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Transaction type does not exist');
  });

  // 5. Crear transacción con category_id inválido
  it('should return 400 for creating a transaction with invalid category_id', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        category_id: 999999, // ID de categoría que no existe
        amount: 10.00,
        description: 'Intento fallido'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Category does not exist');
  });

  // 6. Crear transacción con amount negativo
  it('should return 400 for creating a transaction with negative amount', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        amount: -10.00,
        description: 'Monto negativo'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Amount must be a positive number');
  });

  // 7. Crear transacción con amount cero
  it('should return 400 for creating a transaction with zero amount', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        amount: 0,
        description: 'Monto cero'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Amount must be a positive number');
  });

  // 8. Crear transacción sin user_id
  it('should return 400 for creating a transaction without user_id', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        type_id: validTypeId,
        amount: 10.00
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'User ID, Type ID, and Amount are required');
  });

  // 9. Crear transacción sin type_id
  it('should return 400 for creating a transaction without type_id', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        amount: 10.00
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'User ID, Type ID, and Amount are required');
  });

  // 10. Crear transacción sin amount
  it('should return 400 for creating a transaction without amount', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeId
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'User ID, Type ID, and Amount are required');
  });

  // 11. Obtener transacción por ID
  it('should get a transaction by ID', async () => {
    const res = await request(app).get(`/transactions/${createdTransactionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdTransactionId);
    expect(res.body).toHaveProperty('user_id', validUserId);
    expect(res.body).toHaveProperty('type_name'); // Asegura que el nombre del tipo se une
    expect(res.body).toHaveProperty('category_name'); // Asegura que el nombre de la categoría se une
  });

  // 12. Obtener transacción inexistente
  it('should return 404 for a non-existent transaction ID', async () => {
    const res = await request(app).get('/transactions/99999999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Transaction not found');
  });

  // 13. Obtener transacción con ID inválido (no numérico)
  it('should return 400 for invalid transaction ID (non-numeric)', async () => {
    const res = await request(app).get('/transactions/abc');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid transaction ID');
  });

  // 14. Obtener todas las transacciones (sin filtros)
  it('should get all transactions without filters', async () => {
    const res = await request(app).get('/transactions');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2); // Al menos las dos que creamos
    expect(res.body.some(t => t.id === createdTransactionId)).toBe(true);
    expect(res.body.some(t => t.id === createdTransactionId2)).toBe(true);
  });

  // 15. Obtener transacciones filtradas por user_id
  it('should get transactions filtered by user_id', async () => {
    const res = await request(app).get(`/transactions?user_id=${validUserId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every(t => t.user_id === validUserId)).toBe(true);
  });

  // 16. Obtener transacciones filtradas por type_id
  it('should get transactions filtered by type_id', async () => {
    const res = await request(app).get(`/transactions?type_id=${validTypeId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every(t => t.type_id === validTypeId)).toBe(true);
  });

  // 17. Obtener transacciones filtradas por from y to date
  it('should get transactions filtered by date range', async () => {
    // Esperar un momento para asegurar diferentes timestamps si se ejecuta rápido
    await new Promise(resolve => setTimeout(resolve, 100));

    // Crear una transacción con una fecha específica para testear el rango
    const dateSpecificTransactionRes = await request(app)
      .post('/transactions')
      .send({
        user_id: validUserId,
        type_id: validTypeIdExpense,
        amount: 25.00,
        description: 'Test date range',
        // Asegurarse de que el formato de fecha sea compatible con MySQL DATETIME
        created_at: '2025-01-15T10:00:00.000Z'
      });
    expect(dateSpecificTransactionRes.statusCode).toBe(201);
    const dateSpecificTransactionId = dateSpecificTransactionRes.body.id;

    const fromDate = '2025-01-14T00:00:00Z';
    const toDate = '2025-01-16T00:00:00Z';
    const res = await request(app).get(`/transactions?from=${fromDate}&to=${toDate}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(t => t.id === dateSpecificTransactionId)).toBe(true);
    await db.query('DELETE FROM transactions WHERE id = ?', [dateSpecificTransactionId]); // Limpiar esta transacción
  });

  // 18. Actualizar transacción (PUT)
  it('should fully update a transaction (PUT)', async () => {
    const updatedDescription = 'Descripción actualizada PUT';
    const updatedAmount = 200.75;
    const res = await request(app)
      .put(`/transactions/${createdTransactionId}`)
      .send({
        user_id: validUserId,
        type_id: validTypeIdExpense,
        category_id: othersCategoryId,
        amount: updatedAmount,
        description: updatedDescription
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Transaction updated');

    const getRes = await request(app).get(`/transactions/${createdTransactionId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.description).toBe(updatedDescription);
    expect(getRes.body.amount).toBe(updatedAmount);
    expect(getRes.body.type_id).toBe(validTypeIdExpense);
    expect(getRes.body.category_id).toBe(othersCategoryId);
  });

  // 19. Actualizar transacción (PATCH)
  it('should partially update a transaction (PATCH)', async () => {
    const patchedDescription = 'Descripción parcheada PATCH';
    const res = await request(app)
      .patch(`/transactions/${createdTransactionId2}`)
      .send({
        description: patchedDescription
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Transaction patched');

    const getRes = await request(app).get(`/transactions/${createdTransactionId2}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.description).toBe(patchedDescription);
    expect(getRes.body.amount).toBe(50.00); // El monto original no debe cambiar
  });

  // 20. Actualizar transacción inexistente (PUT)
  it('should return 404 when updating a non-existent transaction (PUT)', async () => {
    const res = await request(app)
      .put('/transactions/99999999')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        amount: 10.00
      });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Transaction not found');
  });

  // 21. Actualizar transacción inexistente (PATCH)
  it('should return 404 when updating a non-existent transaction (PATCH)', async () => {
    const res = await request(app)
      .patch('/transactions/99999999')
      .send({
        amount: 10.00
      });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Transaction not found');
  });

  // 22. Actualizar transacción con ID inválido (PUT)
  it('should return 400 for updating a transaction with invalid ID (PUT)', async () => {
    const res = await request(app)
      .put('/transactions/xyz')
      .send({
        user_id: validUserId,
        type_id: validTypeId,
        amount: 10.00
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid transaction ID');
  });

  // 23. Actualizar transacción con ID inválido (PATCH)
  it('should return 400 for updating a transaction with invalid ID (PATCH)', async () => {
    const res = await request(app)
      .patch('/transactions/xyz')
      .send({
        amount: 10.00
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid transaction ID');
  });

  // 24. PUT con user_id inválido
  it('should fail to update transaction with invalid user_id (PUT)', async () => {
    const res = await request(app)
      .put(`/transactions/${createdTransactionId}`)
      .send({
        user_id: 999999,
        type_id: validTypeId,
        amount: 100
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'User does not exist');
  });

  // 25. PATCH con category_id inválido
  it('should fail to update transaction with invalid category_id (PATCH)', async () => {
    const res = await request(app)
      .patch(`/transactions/${createdTransactionId}`)
      .send({
        category_id: 999999
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Category does not exist');
  });

  // 26. Eliminar transacción
  it('should delete a transaction', async () => {
    const res = await request(app).delete(`/transactions/${createdTransactionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Transaction deleted');
  });

  // 27. Eliminar transacción inexistente
  it('should fail to delete a non-existent transaction', async () => {
    const res = await request(app).delete(`/transactions/${createdTransactionId}`); // Intentar eliminar de nuevo
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'Transaction not found');
  });

  // 28. PUT con body vacío
  it('should fail to update with empty body (PUT)', async () => {
    const res = await request(app)
      .put(`/transactions/${createdTransactionId2}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'No fields to update');
  });

  // 29. PATCH con body vacío
  it('should fail to patch with empty body (PATCH)', async () => {
    const res = await request(app)
      .patch(`/transactions/${createdTransactionId2}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'No fields to update');
  });

  // 30. DELETE con ID no numérico
  it('should fail to delete with non-numeric ID', async () => {
    const res = await request(app).delete('/transactions/bad-id');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid transaction ID');
  });

  // 31. PATCH con amount negativo
  it('should fail to patch with negative amount', async () => {
    const res = await request(app)
      .patch(`/transactions/${createdTransactionId2}`)
      .send({ amount: -5 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Amount must be a positive number');
  });

  // 32. PATCH con amount cero
  it('should fail to patch with zero amount', async () => {
    const res = await request(app)
      .patch(`/transactions/${createdTransactionId2}`)
      .send({ amount: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Amount must be a positive number');
  });
});
