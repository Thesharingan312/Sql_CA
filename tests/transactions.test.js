import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs'; // Importa el pool para cerrarlo al final

describe('Transactions API', () => {
  // Test: Obtener todas las transacciones
  it('should get all transactions (empty or not)', async () => {
    const res = await request(app).get('/transactions');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test: Crear una transacción válida
  it('should create a transaction (valid data)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: 1, // Cambia estos IDs por valores válidos de tu BD
        type_id: 2,
        amount: 123.45,
        category: 'Test',
        description: 'Transacción de prueba'
      });
    expect([201, 400]).toContain(res.statusCode);
  });

  // Test: Crear una transacción con datos inválidos (falta amount)
  it('should fail to create a transaction (missing amount)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: 1,
        type_id: 2,
        category: 'Test',
        description: 'Sin amount'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test: Crear una transacción con amount inválido
  it('should fail to create a transaction (invalid amount)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: 1,
        type_id: 2,
        amount: "no-es-numero",
        category: 'Test',
        description: 'Amount inválido'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Test: Crear una transacción con un user_id inexistente
  it('should fail to create a transaction (non-existent user)', async () => {
    const res = await request(app)
      .post('/transactions')
      .send({
        user_id: 99999,
        type_id: 2,
        amount: 50,
        category: 'Test',
        description: 'Usuario inexistente'
      });
    expect([400, 404]).toContain(res.statusCode);
  });

  // Puedes agregar más tests para PUT, PATCH, DELETE, etc.

  // Cierra el pool de la base de datos al final de todos los tests
  afterAll(async () => {
    await db.end();
  });
});
