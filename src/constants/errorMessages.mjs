// src/constants/errorMessages.mjs

/**
 *  Módulo para centralizar los mensajes de error de la API.
 *  Esto mejora la consistencia y facilita la internacionalización futura.
 *
 *  Module to centralize API error messages.
 *  This improves consistency and facilitates future internationalization.
 */

export const ERROR_MESSAGES = {
    // Errores generales / General errors
    SERVER_ERROR: 'Ocurrió un error en el servidor. Por favor, inténtelo de nuevo más tarde.',
    BAD_REQUEST: 'Solicitud inválida. Por favor, revise los datos proporcionados.',
    NOT_FOUND: 'Recurso no encontrado.',
    NO_FIELDS_TO_UPDATE: 'No se proporcionaron campos para actualizar.',
    INVALID_ID: 'ID inválido. El ID debe ser un número entero positivo.',
    MISSING_REQUIRED_FIELDS: 'Faltan campos obligatorios en la solicitud.', // Añadido para un mensaje más genérico

    // Errores de usuario / User errors
    USER: {
        NOT_FOUND: 'Usuario no encontrado.',
        ALREADY_EXISTS: 'El email ya está registrado.',
        INVALID_EMAIL_FORMAT: 'Formato de email inválido.',
        MISSING_FIELDS: 'Faltan campos obligatorios para crear el usuario.',
        // Aunque isValidId ya tiene un mensaje general, podemos añadir uno específico si se quiere
        // INVALID_ID: 'ID de usuario inválido. El ID debe ser un número entero positivo.', 
    },

    // Errores de perfil / Profile errors
    PROFILE: {
        NOT_FOUND: 'Perfil no encontrado.',
        ALREADY_EXISTS: 'El nombre del perfil ya existe.',
        NAME_REQUIRED: 'El nombre del perfil es obligatorio.',
        ASSOCIATED_USERS_EXIST: 'No se puede eliminar el perfil: existen usuarios asociados.',
    },

    // Errores de transacción / Transaction errors
    TRANSACTION: {
        NOT_FOUND: 'Transacción no encontrada.',
        INVALID_AMOUNT: 'El monto debe ser un número positivo.',
        MISSING_FIELDS: 'Faltan campos obligatorios para crear la transacción.',
    },

    // Errores de tipo de transacción / Transaction type errors
    TRANSACTION_TYPE: {
        NOT_FOUND: 'Tipo de transacción no encontrado.',
        ALREADY_EXISTS: 'El nombre del tipo de transacción ya existe.',
        NAME_REQUIRED: 'El nombre del tipo de transacción es obligatorio.',
        ASSOCIATED_TRANSACTIONS_EXIST: 'No se puede eliminar el tipo de transacción: existen transacciones asociadas.',
    },
//By @Thesharingan312
    // Errores de categoría / Category errors
    CATEGORY: {
        NOT_FOUND: 'Categoría no encontrada.',
        ALREADY_EXISTS: 'El nombre de la categoría ya existe.',
        NAME_REQUIRED: 'El nombre de la categoría es obligatorio.',
        ASSOCIATED_TRANSACTIONS_EXIST: 'No se puede eliminar la categoría: existen transacciones asociadas.',
    },

    // Errores de presupuesto / Budget errors (NUEVO)
    BUDGET: {
        NOT_FOUND: 'Presupuesto no encontrado.',
        ALREADY_EXISTS: 'Ya existe un presupuesto para este usuario, categoría, año y mes.',
        MISSING_FIELDS: 'Faltan campos obligatorios para crear o actualizar el presupuesto.',
    },

    // Errores de validación de existencia de foráneas
    FOREIGN_KEY: {
        USER_NOT_EXIST: 'El usuario especificado no existe.',
        PROFILE_NOT_EXIST: 'El perfil especificado no existe.',
        TRANSACTION_TYPE_NOT_EXIST: 'El tipo de transacción especificado no existe.',
        CATEGORY_NOT_EXIST: 'La categoría especificada no existe.',
    },
};