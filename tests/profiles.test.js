// tests/profiles.test.js

import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Profiles API (integración completa)', () => {
    let createdProfileId;

    // Limpiar la base de datos después de todos los tests
    afterAll(async () => {
        if (createdProfileId) {
            try {
                // Eliminar el perfil creado durante los tests
                await db.query('DELETE FROM profiles WHERE id = ?', [createdProfileId]);
                console.log(`Cleaned up profile with ID: ${createdProfileId}`);
            } catch (err) {
                console.error(`Error during test cleanup for profile ${createdProfileId}:`, err);
            }
        }
        await db.end(); // Cerrar la conexión a la base de datos después de todos los tests
    });

    // 1. Crear un nuevo perfil válido
    it('should create a new profile', async () => {
        const res = await request(app)
            .post('/profiles')
            .send({ name: 'TestProfile' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('TestProfile');
        createdProfileId = res.body.id;
    });

    // 2. Obtener el perfil creado
    it('should get the created profile by ID', async () => {
        const res = await request(app).get(`/profiles/${createdProfileId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({
            id: createdProfileId,
            name: 'TestProfile'
        });
    });

    // 3. Obtener todos los perfiles (asegura que devuelve un array)
    it('should get all profiles', async () => {
        const res = await request(app).get('/profiles');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some(profile => profile.id === createdProfileId)).toBe(true);
    });

    // 4. Intentar crear un perfil con nombre duplicado
    it('should return 409 when creating a profile with duplicate name', async () => {
        const res = await request(app)
            .post('/profiles')
            .send({ name: 'TestProfile' }); // Usar el mismo nombre

        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('error', 'Profile name already exists');
    });

    // 5. Actualizar el perfil creado
    it('should update the created profile', async () => {
        const res = await request(app)
            .put(`/profiles/${createdProfileId}`)
            .send({ name: 'UpdatedProfile' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Profile updated');

        const getRes = await request(app).get(`/profiles/${createdProfileId}`);
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body.name).toBe('UpdatedProfile');
    });

    // 6. Intentar actualizar un perfil inexistente
    it('should return 404 when updating a non-existent profile', async () => {
        const res = await request(app)
            .put('/profiles/99999')
            .send({ name: 'NonExistentProfile' });
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Profile not found');
    });

    // 7. Intentar actualizar un perfil con nombre duplicado
    it('should return 409 when updating a profile with a duplicate name', async () => {
        // Crear un segundo perfil para tener un nombre duplicado
        const res2 = await request(app)
            .post('/profiles')
            .send({ name: 'AnotherProfile' });
        expect(res2.statusCode).toBe(201);
        const anotherProfileId = res2.body.id;

        const res = await request(app)
            .put(`/profiles/${anotherProfileId}`)
            .send({ name: 'UpdatedProfile' }); // Nombre que ya existe

        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('error', 'Profile name already exists');

        // Limpiar el segundo perfil
        await db.query('DELETE FROM profiles WHERE id = ?', [anotherProfileId]);
    });

    // 8. Eliminar el perfil
    it('should delete the profile', async () => {
        const res = await request(app).delete(`/profiles/${createdProfileId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Profile deleted');
        createdProfileId = null; // Resetear para evitar intentos de limpieza duplicados
    });

    // 9. Verificar que ya no existe
    it('should return 404 for deleted profile', async () => {
        const res = await request(app).get(`/profiles/${createdProfileId}`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Profile not found');
    });

    // 10. Intentar eliminar un perfil inexistente
    it('should return 404 for deleting a non-existent profile', async () => {
        const res = await request(app).delete(`/profiles/99999`);
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Profile not found');
    });

    // 11. Intentar obtener perfil con ID inválido
    it('should fail to get a profile with invalid ID', async () => {
        const res = await request(app).get('/profiles/abc');
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Invalid profile ID');
    });

    // 12. Intentar actualizar perfil con ID inválido
    it('should fail to update a profile with invalid ID', async () => {
        const res = await request(app)
            .put('/profiles/xyz')
            .send({ name: 'InvalidIDProfile' });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Invalid profile ID');
    });

    // 13. Intentar eliminar perfil con ID inválido
    it('should fail to delete a profile with invalid ID', async () => {
        const res = await request(app).delete('/profiles/bad-id');
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Invalid profile ID');
    });

    // 14. Intentar crear perfil con nombre vacío
    it('should fail to create a profile with empty name', async () => {
        const res = await request(app)
            .post('/profiles')
            .send({ name: '' });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Profile name is required');
    });

    // 15. Intentar crear perfil sin nombre
    it('should fail to create a profile without name', async () => {
        const res = await request(app)
            .post('/profiles')
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Profile name is required');
    });

    // 16. Intentar actualizar perfil con nombre vacío
    it('should fail to update a profile with empty name', async () => {
        // Crear un perfil temporal para actualizar
        const tempRes = await request(app)
            .post('/profiles')
            .send({ name: 'TempProfileForUpdate' });
        const tempProfileId = tempRes.body.id;

        const res = await request(app)
            .put(`/profiles/${tempProfileId}`)
            .send({ name: '' });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Profile name is required');

        // Limpiar perfil temporal
        await db.query('DELETE FROM profiles WHERE id = ?', [tempProfileId]);
    });
});
