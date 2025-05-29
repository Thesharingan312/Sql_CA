// src/app.js

// Importa las dependencias principales | Import main dependencies
import express from 'express';
import userRoutes from './modules/users/user.controller.mjs';
import transactionRoutes from './modules/transactions/transaction.controller.mjs';
import profileRoutes from './modules/profiles/profile.controller.mjs';
import categoryRoutes from './modules/categories/category.controller.mjs';
import transactionTypeRoutes from './modules/transaction_types/transaction_type.controller.mjs'
import budgetRoutes from './modules/budgets/budget.controller.mjs';
import savingTypeRoutes from './modules/savings_types/saving_type.controller.mjs'
import savingRoutes from './modules/savings/saving.controller.mjs'
import setupSwagger from '../docs/swagger.mjs'; // Ajusta la ruta si tu carpeta docs está en otro sitio

const app = express();
app.use(express.json()); // Permite recibir y procesar JSON | Allows receiving and processing JSON

// Monta las rutas de usuarios y transacciones | Mount user and transaction routes
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/profiles', profileRoutes);
app.use('/categories', categoryRoutes);
app.use('/transaction_types', transactionTypeRoutes);
app.use('/budgets', budgetRoutes);
app.use('/savings_types', savingTypeRoutes);
app.use('/savings', savingRoutes);
// Ruta raíz para verificar que el servidor está funcionando | Root route to check if the server is running

// Configura Swagger | Setup Swagger
setupSwagger(app);
//By @Thesharingan312
export default app;