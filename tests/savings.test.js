// tests/savings.test.js

import request from 'supertest';
import app from '../src/app.js'; // Asegúrate que esta sea la ruta correcta a tu app Express
import db from '../src/db/DBHelper.mjs';
import { ERROR_MESSAGES } from '../src/constants/errorMessages.mjs';

describe('Savings API (integración completa)', () => {
    let createdProfileId;
    let createdUserId;
    let createdSavingTypeId;
    let createdSavingTypeId2;
    let createdSavingId;
    let createdSavingIdForFilters;

    beforeAll(async () => {
        // Limpiar tablas relevantes en el orden correcto para evitar problemas de FK
        await db.query('DELETE FROM savings');
        await db.query('DELETE FROM saving_types');
        await db.query('DELETE FROM users');
        await db.query('DELETE FROM profiles');

        // 1. Crear un Perfil de prueba
        const [profileResult] = await db.query('INSERT INTO profiles (name) VALUES (?)', ['TestProfileForSavings']);
        createdProfileId = profileResult.insertId;

        // 2. Crear un Usuario de prueba
        const [userResult] = await db.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, profile_id) VALUES (?, ?, ?, ?, ?)',
            ['Test', 'UserSavings', 'user.savings@example.com', 'password123', createdProfileId]
        );
        createdUserId = userResult.insertId;

        // 3. Crear Tipos de Ahorro de prueba
        const [savingTypeResult1] = await db.query('INSERT INTO saving_types (name) VALUES (?)', ['Emergency Fund Test']);
        createdSavingTypeId = savingTypeResult1.insertId;

        const [savingTypeResult2] = await db.query('INSERT INTO saving_types (name) VALUES (?)', ['Vacation Fund Test']);
        createdSavingTypeId2 = savingTypeResult2.insertId;
    });

    afterAll(async () => {
        // Limpiar datos creados específicamente si es necesario, aunque el beforeAll del próximo run lo haría.
        // No es estrictamente necesario si beforeAll limpia todo.
        await db.end(); // Cerrar la conexión a la base de datos
    });

    // Test Suite for POST /savings
    describe('POST /savings', () => {
        it('should create a new saving with valid data', async () => {
            const res = await request(app)
                .post('/savings')
                .send({
                    user_id: createdUserId,
                    type_id: createdSavingTypeId,
                    name: 'My First Emergency Saving',
                    amount: 500.75,
                    notes: 'Initial contribution'
                });
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe('My First Emergency Saving');
            expect(res.body.amount).toBe(500.75);
            expect(res.body.user_id).toBe(createdUserId);
            expect(res.body.type_id).toBe(createdSavingTypeId);
            createdSavingId = res.body.id; // Guardar para tests posteriores
        });

        it('should fail to create a saving with missing required fields (e.g., name)', async () => {
            const res = await request(app)
                .post('/savings')
                .send({
                    user_id: createdUserId,
                    type_id: createdSavingTypeId,
                    // name is missing
                    amount: 100
                });
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
        });

        it('should fail to create a saving with non-existent user_id', async () => {
            const nonExistentUserId = 999999;
            const res = await request(app)
                .post('/savings')
                .send({
                    user_id: nonExistentUserId,
                    type_id: createdSavingTypeId,
                    name: 'Saving with invalid user',
                    amount: 100
                });
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.FOREIGN_KEY.USER_NOT_EXIST);
        });

        it('should fail to create a saving with non-existent type_id', async () => {
            const nonExistentSavingTypeId = 999999;
            const res = await request(app)
                .post('/savings')
                .send({
                    user_id: createdUserId,
                    type_id: nonExistentSavingTypeId,
                    name: 'Saving with invalid type',
                    amount: 100
                });
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.FOREIGN_KEY.SAVING_TYPE_NOT_EXIST);
        });

        it('should fail to create a saving with negative amount', async () => {
            const res = await request(app)
                .post('/savings')
                .send({
                    user_id: createdUserId,
                    type_id: createdSavingTypeId,
                    name: 'Negative Amount Saving',
                    amount: -50
                });
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.SAVING.INVALID_AMOUNT);
        });

        it('should fail to create a saving with zero amount', async () => {
            const res = await request(app)
                .post('/savings')
                .send({
                    user_id: createdUserId,
                    type_id: createdSavingTypeId,
                    name: 'Zero Amount Saving',
                    amount: 0
                });
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.SAVING.INVALID_AMOUNT);
        });
    });

    // Test Suite for GET /savings
    describe('GET /savings', () => {
        beforeAll(async () => {
            // Crear un ahorro adicional para pruebas de filtro
            const savingData = {
                user_id: createdUserId,
                type_id: createdSavingTypeId2, // Usar el segundo tipo de ahorro
                name: 'Vacation Saving for Filter',
                amount: 1200,
                notes: 'Filter test'
            };
            const res = await request(app).post('/savings').send(savingData);
            createdSavingIdForFilters = res.body.id;
        });

        it('should get all savings', async () => {
            const res = await request(app).get('/savings');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            // Verificar que al menos los dos ahorros creados estén presentes
            expect(res.body.some(s => s.id === createdSavingId)).toBe(true);
            expect(res.body.some(s => s.id === createdSavingIdForFilters)).toBe(true);
        });

        it('should get savings filtered by user_id', async () => {
            const res = await request(app).get(`/savings?user_id=${createdUserId}`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            res.body.forEach(saving => {
                expect(saving.user_id).toBe(createdUserId);
            });
            expect(res.body.length).toBeGreaterThanOrEqual(2);
        });

        it('should get savings filtered by type_id', async () => {
            const res = await request(app).get(`/savings?type_id=${createdSavingTypeId2}`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            res.body.forEach(saving => {
                expect(saving.type_id).toBe(createdSavingTypeId2);
            });
            expect(res.body.some(s => s.id === createdSavingIdForFilters)).toBe(true);
            expect(res.body.some(s => s.id === createdSavingId)).toBe(false); // El primer ahorro tiene otro type_id
        });

        it('should return empty array for non-existent user_id filter', async () => {
            const res = await request(app).get(`/savings?user_id=999888`);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });
    });

    // Test Suite for GET /savings/:id
    describe('GET /savings/:id', () => {
        it('should get a saving by its ID', async () => {
            const res = await request(app).get(`/savings/${createdSavingId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('id', createdSavingId);
            expect(res.body.name).toBe('My First Emergency Saving');
        });

        it('should fail to get a saving with a non-existent ID', async () => {
            const res = await request(app).get('/savings/999999');
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.SAVING.NOT_FOUND);
        });

        it('should fail to get a saving with an invalid ID format', async () => {
            const res = await request(app).get('/savings/abc');
            expect(res.statusCode).toBe(400);
            // El mensaje exacto dependerá de si la validación de ID está en el servicio o si el error es de BD.
            // Asumiendo que validation.mjs lo maneja:
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.INVALID_ID);
        });
    });

    // Test Suite for PUT /savings/:id
    describe('PUT /savings/:id', () => {
        it('should fully update a saving', async () => {
            const res = await request(app)
                .put(`/savings/${createdSavingId}`)
                .send({
                    user_id: createdUserId, // Puede ser el mismo u otro válido
                    type_id: createdSavingTypeId2, // Cambiando el tipo
                    name: 'Updated Emergency Saving Full',
                    amount: 600.00,
                    notes: 'Updated fully'
                });
            expect(res.statusCode).toBe(200); // Asumiendo que PUT devuelve un mensaje simple o el objeto
            expect(res.body).toHaveProperty('message', 'Saving updated'); // O el objeto si la API lo devuelve

            // Opcional: verificar que los datos se actualizaron realmente
            const fetchRes = await request(app).get(`/savings/${createdSavingId}`);
            expect(fetchRes.body.name).toBe('Updated Emergency Saving Full');
            expect(fetchRes.body.amount).toBe(600.00);
            expect(fetchRes.body.type_id).toBe(createdSavingTypeId2);
        });

        it('should fail to update a non-existent saving', async () => {
            const res = await request(app)
                .put('/savings/999999')
                .send({
                    user_id: createdUserId,
                    type_id: createdSavingTypeId,
                    name: 'Non Existent Update',
                    amount: 100
                });
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.SAVING.NOT_FOUND);
        });

        it('should fail to update with missing required field (name)', async () => {
            const res = await request(app)
                .put(`/savings/${createdSavingId}`)
                .send({
                    user_id: createdUserId,
                    type_id: createdSavingTypeId,
                    // name is missing
                    amount: 650.00
                });
            expect(res.statusCode).toBe(400);
                expect(res.body).toHaveProperty('error', ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
        });
    });

    // Test Suite for PATCH /savings/:id
    describe('PATCH /savings/:id', () => {
        it('should partially update a saving (e.g., only name)', async () => {
            const res = await request(app)
                .patch(`/savings/${createdSavingId}`)
                .send({ name: 'Patched Saving Name' });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Saving patched');

            const fetchRes = await request(app).get(`/savings/${createdSavingId}`);
            expect(fetchRes.body.name).toBe('Patched Saving Name');
        });

        it('should partially update a saving (e.g., only amount)', async () => {
            const res = await request(app)
                .patch(`/savings/${createdSavingId}`)
                .send({ amount: 777.77 });
            expect(res.statusCode).toBe(200);
                expect(res.body).toHaveProperty('message', 'Saving patched');

            const fetchRes = await request(app).get(`/savings/${createdSavingId}`);
            expect(fetchRes.body.amount).toBe(777.77);
        });
        
        it('should partially update notes to null', async () => {
            const res = await request(app)
                .patch(`/savings/${createdSavingId}`)
                .send({ notes: null });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Saving patched');

            const fetchRes = await request(app).get(`/savings/${createdSavingId}`);
            expect(fetchRes.body.notes).toBeNull();
        });


        it('should fail to patch a non-existent saving', async () => {
            const res = await request(app)
                .patch('/savings/999999')
                .send({ name: 'Patch Fail' });
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.SAVING.NOT_FOUND);
        });

        it('should fail to patch with an empty body', async () => {
            const res = await request(app)
                .patch(`/savings/${createdSavingId}`)
                .send({});
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.NO_FIELDS_TO_UPDATE);
        });

        it('should fail to patch amount to be negative', async () => {
            const res = await request(app)
                .patch(`/savings/${createdSavingId}`)
                .send({ amount: -100 });
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.SAVING.INVALID_AMOUNT);
        });
    });

    // Test Suite for DELETE /savings/:id
    describe('DELETE /savings/:id', () => {
        it('should delete a saving', async () => {
            // Primero creamos uno para borrarlo en este test
            const tempSavingRes = await request(app)
                .post('/savings')
                .send({
                    user_id: createdUserId,
                    type_id: createdSavingTypeId,
                    name: 'To Be Deleted Saving',
                    amount: 50
                });
            const tempSavingId = tempSavingRes.body.id;

            const res = await request(app).delete(`/savings/${tempSavingId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Saving deleted');

            // Verificar que ya no existe
            const fetchRes = await request(app).get(`/savings/${tempSavingId}`);
            expect(fetchRes.statusCode).toBe(404);
        });

        it('should fail to delete a non-existent saving', async () => {
            const res = await request(app).delete('/savings/999999');
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.SAVING.NOT_FOUND);
        });

        it('should fail to delete with an invalid ID format', async () => {
            const res = await request(app).delete('/savings/xyz');
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', ERROR_MESSAGES.INVALID_ID);
        });
    });
});