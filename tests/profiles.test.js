import request from 'supertest';
import app from '../src/app.js';
import db from '../src/db/DBHelper.mjs';

describe('Profiles API (integración completa)', () => {
    let createdProfileId;

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
    });

  // 4. Intentar crear un perfil duplicado
    it('should fail to create a duplicate profile', async () => {
        const res = await request(app)
            .post('/profiles')
            .send({ name: 'TestProfile' }); // mismo nombre
            expect(res.statusCode).toBe(409);
            expect(res.body).toHaveProperty('error');
    });

  // 5. Actualizar el perfil
    it('should update the profile', async () => {
        const res = await request(app)
            .put(`/profiles/${createdProfileId}`)
            .send({ name: 'UpdatedProfile' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Profile updated');
    });

  // 6. Obtener el perfil actualizado
    it('should get the updated profile', async () => {
        const res = await request(app).get(`/profiles/${createdProfileId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('UpdatedProfile');
    });

  // 7. Eliminar el perfil
    it('should delete the profile', async () => {
        const res = await request(app).delete(`/profiles/${createdProfileId}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'Profile deleted');
    });

  // 8. Verificar que ya no existe
    it('should return 404 for deleted profile', async () => {
        const res = await request(app).get(`/profiles/${createdProfileId}`);
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error');
    });

  // 9. Intentar eliminar un perfil inexistente
    it('should return 404 for deleting a non-existent profile', async () => {
        const res = await request(app).delete(`/profiles/${createdProfileId}`);
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('error');
    });

  // 10. Intentar obtener perfil con ID inválido
    it('should fail to get a profile with invalid ID', async () => {
        const res = await request(app).get('/profiles/abc');
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error');
    });

  // 🔚 Cierra la conexión a la DB al final
    afterAll(async () => {
        await db.query('DELETE FROM profiles WHERE name = "TestProfile" OR name = "UpdatedProfile"');
        await db.end();
    });
});
