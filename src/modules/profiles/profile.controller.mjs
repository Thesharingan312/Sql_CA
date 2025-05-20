// src/modules/profiles/profile.controller.mjs

import express from 'express';
import * as profileService from './profile.service.mjs';

const router = express.Router();

/**
 *  @swagger
 *  tags:
 *  name: Profiles
 *  description: Profile management | Gestión de perfiles
 */

/**
 *  @swagger
 *  /profiles:
 *  get:
 *  tags: [Profiles]
 *  summary: Get all profiles | Obtener todos los perfiles
 *  responses:
 *  200:
 *  description: List of profiles | Lista de perfiles
 *  content:
 *  application/json:
 *  schema:
 *  type: array
 *  items:
 *  type: object
 *  properties:
 *  id:
 *  type: integer
 *  name:
 *  type: string
 *  500:
 *  description: Server error | Error del servidor
 */
router.get('/', async (req, res) => {
    try {
    const profiles = await profileService.getAllProfiles();
    res.json(profiles);
    } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
    }
});

/**
 *  @swagger
 *  /profiles/{id}:
 *  get:
 *  tags: [Profiles]
 *  summary: Get profile by ID | Obtener perfil por ID
 *  parameters:
 *  - in: path
 *  name: id
 *  required: true
 *  schema:
 *  type: integer
 *  responses:
 *  200:
 *  description: Profile found | Perfil encontrado
 *  content:
 *  application/json:
 *  schema:
 *  type: object
 *  properties:
 *  id:
 *  type: integer
 *  name:
 *  type: string
 *  400:
 *  description: Invalid ID | ID inválido
 *  404:
 *  description: Profile not found | Perfil no encontrado
 *  500:
 *  description: Server error | Error del servidor
 */
router.get('/:id', async (req, res) => {
    try {
    const profile = await profileService.getProfileById(req.params.id);
    res.json(profile);
    } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
    }
});

/**
 *  @swagger
 *  /profiles:
 *  post:
 *  tags: [Profiles]
 *  summary: Create a new profile | Crear un nuevo perfil
 *  requestBody:
 *  required: true
 *  content:
 *  application/json:
 *  schema:
 *  type: object
 *  required:
 *  - name
 *  properties:
 *  name:
 *  type: string
 *  responses:
 *  201:
 *  description: Profile created | Perfil creado
 *  content:
 *  application/json:
 *  schema:
 *  type: object
 *  properties:
 *  id:
 *  type: integer
 *  name:
 *  type: string
 *  400:
 *  description: Invalid input | Entrada inválida
 *  409:
 *  description: Profile name already exists | El nombre del perfil ya existe
 *  500:
 *  description: Server error | Error del servidor
 */
router.post('/', async (req, res) => {
    try {
    const newProfile = await profileService.createProfile(req.body);
    res.status(201).json(newProfile);
    } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
    }
});

/**
 *  @swagger
 *  /profiles/{id}:
 *  put:
 *  tags: [Profiles]
 *  summary: Update an existing profile | Actualizar un perfil existente
 *  parameters:
 *  - in: path
 *  name: id
 *  required: true
 *  schema:
 *  type: integer
 *  requestBody:
 *  required: true
 *  content:
 *  application/json:
 *  schema:
 *  type: object
 *  required:
 *  - name
 *  properties:
 *  name:
 *  type: string
 *  responses:
 *  200:
 *  description: Profile updated | Perfil actualizado
 *  400:
 *  description: Invalid input | Entrada inválida
 *  404:
 *  description: Profile not found | Perfil no encontrado
 *  409:
 *  description: Profile name already exists | El nombre del perfil ya existe
 *  500:
 *  description: Server error | Error del servidor
 */
router.put('/:id', async (req, res) => {
    try {
    await profileService.updateProfile(req.params.id, req.body);
    res.json({ message: 'Profile updated' });
    } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
    }
});

/**
 *  @swagger
 *  /profiles/{id}:
 *  delete:
 *  tags: [Profiles]
 *  summary: Delete a profile | Eliminar un perfil
 *  parameters:
 *  - in: path
 *  name: id
 *  required: true
 *  schema:
 *  type: integer
 *  responses:
 *  200:
 *  description: Profile deleted | Perfil eliminado
 *  400:
 *  description: Invalid ID | ID inválido
 *  404:
 *  description: Profile not found | Perfil no encontrado
 *  409:
 *  description: Conflict, e.g., associated users exist | Conflicto, ej. existen usuarios asociados
 *  500:
 *  description: Server error | Error del servidor
 */
router.delete('/:id', async (req, res) => {
    try {
    await profileService.deleteProfile(req.params.id);
    res.json({ message: 'Profile deleted' });
    } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
    }
});

export default router;