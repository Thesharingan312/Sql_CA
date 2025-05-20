// src/modules/profiles/profile.service.mjs

import * as profileDao from './profile.dao.mjs';

/**
 *  Obtener todos los perfiles | Get all profiles
 */
export async function getAllProfiles() {
    return await profileDao.getAllProfiles();
}

/**
 *  Obtener un perfil por ID | Get a profile by ID
 */
export async function getProfileById(id) {
    if (!id || isNaN(id) || id <= 0) {
    const error = new Error('Invalid profile ID');
    error.status = 400;
    throw error;
    }
    const profile = await profileDao.getProfileById(id);
    if (!profile) {
    const error = new Error('Profile not found');
    error.status = 404;
    throw error;
    }
    return profile;
}

/**
 *  Crear un nuevo perfil | Create a new profile
 */
export async function createProfile(profileData) {
    if (!profileData || !profileData.name || profileData.name.trim() === '') {
    const error = new Error('Profile name is required');
    error.status = 400;
    throw error;
    }

    const existingProfile = await profileDao.getProfileByName(profileData.name);
    if (existingProfile) {
    const error = new Error('Profile name already exists');
    error.status = 409; // Conflict
    throw error;
    }

    return await profileDao.createProfile(profileData);
}

/**
 *  Actualizar un perfil existente | Update an existing profile
 */
export async function updateProfile(id, profileData) {
    if (!id || isNaN(id) || id <= 0) {
    const error = new Error('Invalid profile ID');
    error.status = 400;
    throw error;
    }
    if (!profileData || !profileData.name || profileData.name.trim() === '') {
    const error = new Error('Profile name is required');
    error.status = 400;
    throw error;
    }

    // Verificar si el perfil existe
    const profileExists = await profileDao.getProfileById(id);
    if (!profileExists) {
        const error = new Error('Profile not found');
        error.status = 404;
        throw error;
    }

    // Verificar unicidad del nombre si se cambia
    const existingProfile = await profileDao.getProfileByName(profileData.name);
    if (existingProfile && existingProfile.id != id) {
    const error = new Error('Profile name already exists');
    error.status = 409; // Conflict
    throw error;
    }

    const updated = await profileDao.updateProfile(id, profileData);
    if (!updated) {
    // Esto podría ocurrir si el ID no existe (aunque ya lo verificamos) o no hay cambios
    const error = new Error('Failed to update profile or no changes made');
    error.status = 400; // O 404 si es estrictamente por no encontrado
    throw error;
    }
    return updated;
}

/**
 *  Eliminar un perfil por ID | Delete a profile by ID
 */
export async function deleteProfile(id) {
    if (!id || isNaN(id) || id <= 0) {
    const error = new Error('Invalid profile ID');
    error.status = 400;
    throw error;
    }

    // Opcional: Podrías añadir una verificación aquí si hay usuarios asociados a este perfil
    // const usersWithProfile = await userDao.getUsersByProfileId(id);
    // if (usersWithProfile.length > 0) {
    //   const error = new Error('Cannot delete profile: associated users exist');
    //   error.status = 409;
    //   throw error;
    // }

    const deleted = await profileDao.deleteProfile(id);
    if (!deleted) {
    const error = new Error('Profile not found');
    error.status = 404;
    throw error;
    }
    return deleted;
}