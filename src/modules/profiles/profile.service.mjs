// src/modules/profiles/profile.service.mjs

import * as profileDao from './profile.dao.mjs';
import * as userDao from '../users/user.dao.mjs'; 
import { isValidId, validateRequiredFields } from '../../utils/validation.mjs'; 
import { ERROR_MESSAGES } from '../../constants/errorMessages.mjs'; 

/**
 * Obtener todos los perfiles | Get all profiles
 */
export async function getAllProfiles() {
    return await profileDao.getAllProfiles();
}

/**
 * Obtener un perfil por ID | Get a profile by ID
 */
export async function getProfileById(id) {
    isValidId(id, 'Profile ID'); // MODIFICADO
    const profile = await profileDao.getProfileById(id);
    if (!profile) {
        const error = new Error(ERROR_MESSAGES.PROFILE.NOT_FOUND); // MODIFICADO
        error.status = 404;
        throw error;
    }
    return profile;
}

/**
 * Crear un nuevo perfil | Create a new profile
 */
export async function createProfile(profileData) {
    // MODIFICADO: Usar validateRequiredFields
    validateRequiredFields(profileData, ['name'], 'Profile');

    const existingProfile = await profileDao.getProfileByName(profileData.name);
    if (existingProfile) {
        const error = new Error(ERROR_MESSAGES.PROFILE.ALREADY_EXISTS); // MODIFICADO
        error.status = 409; 
        throw error;
    }

    return await profileDao.createProfile(profileData);
}

/**
 * Actualizar un perfil existente | Update an existing profile
 */
export async function updateProfile(id, profileData) {
    isValidId(id, 'Profile ID'); // MODIFICADO
    
    // MODIFICADO: Usar validateRequiredFields
    validateRequiredFields(profileData, ['name'], 'Profile');

    const profileExists = await profileDao.getProfileById(id);
    if (!profileExists) {
        const error = new Error(ERROR_MESSAGES.PROFILE.NOT_FOUND); // MODIFICADO
        error.status = 404;
        throw error;
    }

    const existingProfileByName = await profileDao.getProfileByName(profileData.name);
    if (existingProfileByName && existingProfileByName.id != id) {
        const error = new Error(ERROR_MESSAGES.PROFILE.ALREADY_EXISTS); // MODIFICADO
        error.status = 409; 
        throw error;
    }

    const updatedCount = await profileDao.updateProfile(id, profileData);
    if (!updatedCount) {
        const error = new Error(ERROR_MESSAGES.BAD_REQUEST + " (Failed to update profile or no changes made)"); // MODIFICADO
        error.status = 400; 
        throw error;
    }
    return { id, ...profileData }; // O recargar: await getProfileById(id);
}

/**
 * Eliminar un perfil por ID | Delete a profile by ID
 */
export async function deleteProfile(id) {
    isValidId(id, 'Profile ID'); // MODIFICADO

    const usersWithProfile = await userDao.getUsersByProfileId(id);
    if (usersWithProfile && usersWithProfile.length > 0) {
        const error = new Error(ERROR_MESSAGES.PROFILE.ASSOCIATED_USERS_EXIST); // MODIFICADO
        error.status = 409;
        throw error;
    }

    const deletedCount = await profileDao.deleteProfile(id);
    if (!deletedCount) {
        const error = new Error(ERROR_MESSAGES.PROFILE.NOT_FOUND); // MODIFICADO
        error.status = 404;
        throw error;
    }
    return { message: "Profile deleted successfully." };
}